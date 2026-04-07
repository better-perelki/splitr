package com.splitr.repository;

import com.splitr.entity.FriendRequest;
import com.splitr.entity.FriendRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, UUID> {

    Optional<FriendRequest> findBySenderIdAndReceiverId(UUID senderId, UUID receiverId);

    boolean existsBySenderIdAndReceiverId(UUID senderId, UUID receiverId);

    List<FriendRequest> findByReceiverIdAndStatus(UUID receiverId, FriendRequestStatus status);

    List<FriendRequest> findBySenderIdAndStatus(UUID senderId, FriendRequestStatus status);

    @Query("""
        SELECT fr FROM FriendRequest fr
        WHERE (fr.sender.id = :userId OR fr.receiver.id = :userId)
        AND fr.status = com.splitr.entity.FriendRequestStatus.ACCEPTED
    """)
    List<FriendRequest> findAcceptedForUser(UUID userId);
}