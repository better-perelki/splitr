package com.splitr.service;

import com.splitr.dto.FriendRequestDetails;
import com.splitr.dto.Friendship;
import com.splitr.entity.AutoConnectResult;
import com.splitr.entity.FriendRequest;
import com.splitr.entity.FriendRequestStatus;
import com.splitr.entity.User;
import com.splitr.mapper.FriendMapper;
import com.splitr.repository.FriendRequestRepository;
import com.splitr.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class FriendService {

    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;
    private final FriendMapper mapper;

    public FriendService(FriendRequestRepository repo,
                         UserRepository userRepo,
                         FriendMapper mapper) {
        this.friendRequestRepository = repo;
        this.userRepository = userRepo;
        this.mapper = mapper;
    }

    private void createNewRequest(User sender, User receiver) {
        FriendRequest fr = new FriendRequest();
        fr.setSender(sender);
        fr.setReceiver(receiver);

        try {
            friendRequestRepository.save(fr);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("Request already exists");
        }
    }

    private boolean handleExisting(UUID senderId, UUID receiverId, User sender, User receiver) {

        var existing = friendRequestRepository.findBySenderIdAndReceiverId(senderId, receiverId);

        if (existing.isPresent()) {
            var fr = existing.get();

            return switch (fr.getStatus()) {
                case PENDING -> throw new IllegalArgumentException("Request already sent");
                case ACCEPTED -> throw new IllegalArgumentException("Already friends");
                case DECLINED -> {
                    fr.setStatus(FriendRequestStatus.PENDING);
                    yield true;
                }
            };
        }

        var reverse = friendRequestRepository.findBySenderIdAndReceiverId(receiverId, senderId);

        if (reverse.isPresent()) {
            var fr = reverse.get();

            return switch (fr.getStatus()) {
                case PENDING -> {
                    fr.setStatus(FriendRequestStatus.ACCEPTED);
                    yield true;
                }
                case ACCEPTED -> throw new IllegalArgumentException("Already friends");
                case DECLINED -> {
                    fr.setStatus(FriendRequestStatus.PENDING);
                    fr.setSender(sender);
                    fr.setReceiver(receiver);
                    yield true;
                }
            };
        }
        return false;
    }

    @Transactional
    public void sendRequest(UUID senderId, UUID receiverId) {
        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException("Cannot add yourself");
        }

        var sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        var receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));

        if (handleExisting(senderId, receiverId, sender, receiver)) {
            return;
        }

        createNewRequest(sender, receiver);
    }

    @Transactional
    public void sendRequestByUsername(UUID senderId, String username) {
        User receiver = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Użytkownik " + username + " nie istnieje"));

        sendRequest(senderId, receiver.getId());
    }

    @Transactional
    public void accept(UUID requestId, UUID userId) {
        var fr = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (!fr.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("Not your request");
        }

        if (fr.getStatus() != FriendRequestStatus.PENDING) {
            throw new IllegalStateException("Request already processed");
        }

        fr.setStatus(FriendRequestStatus.ACCEPTED);
    }

    public AutoConnectResult autoConnect(UUID currentUserId, UUID targetUserId) {

        if (currentUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot add yourself");
        }

        FriendRequest relation = friendRequestRepository
                .findRelationBetweenUsers(currentUserId, targetUserId)
                .orElse(null);

        if (relation == null) {
            FriendRequest fr = new FriendRequest();
            var sender = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
            var receiver = userRepository.findById(targetUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
            fr.setSender(sender);
            fr.setReceiver(receiver);
            fr.setStatus(FriendRequestStatus.ACCEPTED);

            friendRequestRepository.save(fr);
            return AutoConnectResult.SUCCESS;
        }

        if (relation.getStatus() == FriendRequestStatus.ACCEPTED) {
            return AutoConnectResult.ALREADY_FRIENDS;
        }

        if (relation.getStatus() == FriendRequestStatus.PENDING || relation.getStatus() == FriendRequestStatus.DECLINED ) {
            relation.setStatus(FriendRequestStatus.ACCEPTED);
            friendRequestRepository.save(relation);
            return AutoConnectResult.SUCCESS;
        }

        return AutoConnectResult.SUCCESS;
    }

    @Transactional
    public void decline(UUID requestId, UUID userId) {
        var fr = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (!fr.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("Not your request");
        }

        if (fr.getStatus() != FriendRequestStatus.PENDING) {
            throw new IllegalStateException("Request already processed");
        }

        fr.setStatus(FriendRequestStatus.DECLINED);
    }

    @Transactional(readOnly = true)
    public List<Friendship> getFriends(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        return friendRequestRepository.findAcceptedForUser(userId).stream()
                .map(fr -> mapper.toFriendship(fr, userId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FriendRequestDetails> getPending(UUID userId) {
        return friendRequestRepository
                .findByReceiverIdAndStatus(userId, FriendRequestStatus.PENDING)
                .stream()
                .map(mapper::toFriendRequestDetails)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FriendRequestDetails> getSent(UUID userId) {
        return friendRequestRepository
                .findBySenderIdAndStatus(userId, FriendRequestStatus.PENDING)
                .stream()
                .map(mapper::toFriendRequestDetails)
                .toList();
    }

    @Transactional
    public void cancelRequest(UUID requestId, UUID userId) {
        var fr = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (!fr.getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("Not your request");
        }

        if (fr.getStatus() != FriendRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot cancel processed request");
        }

        friendRequestRepository.delete(fr);
    }

    @Transactional
    public void removeFriend(UUID requestId, UUID userId) {
        var fr = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Relation not found"));

        if (!fr.getSender().getId().equals(userId) &&
                !fr.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("Not your relation");
        }

        if (fr.getStatus() != FriendRequestStatus.ACCEPTED) {
            throw new IllegalStateException("Not a friendship");
        }

        friendRequestRepository.delete(fr);
    }

    public boolean areFriends(UUID userId1, UUID userId2) {
        return friendRequestRepository.existsByUsersAndStatus(userId1, userId2, FriendRequestStatus.ACCEPTED);
    }
}