package com.splitr.service;

import com.splitr.dto.*;
import com.splitr.entity.*;
import com.splitr.exception.ResourceNotFoundException;
import com.splitr.exception.UnauthorizedException;
import com.splitr.repository.GroupMemberRepository;
import com.splitr.repository.GroupRepository;
import com.splitr.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    public GroupService(GroupRepository groupRepository,
                        GroupMemberRepository groupMemberRepository,
                        UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
    }

    public GroupResponse createGroup(UUID userId, GroupCreateRequest request) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = new Group();
        group.setName(request.name());
        group.setIcon(request.icon());
        group.setCurrency(request.currency());
        group.setType(request.type());
        
        group = groupRepository.save(group);

        GroupMember member = new GroupMember();
        member.setUser(creator);
        member.setGroup(group);
        member.setRole(GroupRole.ADMIN);
        groupMemberRepository.save(member);

        return mapToResponse(group);
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getUserGroups(UUID userId) {
        return groupMemberRepository.findByUserId(userId).stream()
                .map(GroupMember::getGroup)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GroupDetailsResponse getGroupDetails(UUID userId, UUID groupId) {
        Group group = getGroupIfAuthorized(userId, groupId);

        List<GroupMemberResponse> memberResponses = groupMemberRepository.findByGroupId(groupId).stream()
                .map(m -> new GroupMemberResponse(
                        mapToUserSearchResponse(m.getUser()),
                        m.getRole(),
                        m.getJoinedAt()
                ))
                .collect(Collectors.toList());

        return new GroupDetailsResponse(
                group.getId(),
                group.getName(),
                group.getIcon(),
                group.getCurrency(),
                group.getType(),
                BigDecimal.ZERO, // Mocked balance
                memberResponses
        );
    }

    public GroupResponse updateGroup(UUID userId, UUID groupId, GroupUpdateRequest request) {
        Group group = getGroupIfAdmin(userId, groupId);

        group.setName(request.name());
        group.setIcon(request.icon());
        group.setCurrency(request.currency());
        group.setType(request.type());

        group = groupRepository.save(group);
        return mapToResponse(group);
    }

    public void addMember(UUID currentUserId, UUID groupId, AddMemberRequest request) {
        Group group = getGroupIfAdmin(currentUserId, groupId);

        if (groupMemberRepository.findByGroupIdAndUserId(groupId, request.userId()).isPresent()) {
            throw new IllegalArgumentException("User is already a member of this group");
        }

        User newUser = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User to add not found"));

        GroupMember member = new GroupMember();
        member.setUser(newUser);
        member.setGroup(group);
        member.setRole(GroupRole.MEMBER);
        groupMemberRepository.save(member);
    }

    public void removeMember(UUID currentUserId, UUID groupId, UUID targetUserId) {
        getGroupIfAdmin(currentUserId, groupId);

        if (currentUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot remove yourself from the group");
        }

        GroupMember targetMember = groupMemberRepository.findByGroupIdAndUserId(groupId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in group"));

        if (targetMember.getRole() == GroupRole.ADMIN) {
            throw new IllegalArgumentException("Cannot remove an admin from the group");
        }

        groupMemberRepository.delete(targetMember);
    }

    public void deleteGroup(UUID userId, UUID groupId) {
        getGroupIfAdmin(userId, groupId);
        groupRepository.deleteById(groupId);
    }

    private Group getGroupIfAuthorized(UUID userId, UUID groupId) {
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this group"));
        return member.getGroup();
    }

    private Group getGroupIfAdmin(UUID userId, UUID groupId) {
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this group"));
        if (member.getRole() != GroupRole.ADMIN) {
            throw new UnauthorizedException("Requires ADMIN role");
        }
        return member.getGroup();
    }

    private GroupResponse mapToResponse(Group group) {
        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getIcon(),
                group.getCurrency(),
                group.getType(),
                BigDecimal.ZERO // Mocked balance
        );
    }

    private UserSearchResponse mapToUserSearchResponse(User user) {
        return new UserSearchResponse(
                user.getId(),
                user.getEmail(),
                user.getPhone(),
                user.getUsername(),
                user.getAvatarUrl()
        );
    }
}
