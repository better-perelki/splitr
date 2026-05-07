package com.splitr.service;

import com.splitr.dto.SettlementCreateRequest;
import com.splitr.dto.SettlementResponse;
import com.splitr.dto.UserSummary;
import com.splitr.entity.Group;
import com.splitr.entity.GroupMember;
import com.splitr.entity.GroupRole;
import com.splitr.entity.Settlement;
import com.splitr.entity.User;
import com.splitr.exception.ResourceNotFoundException;
import com.splitr.exception.UnauthorizedException;
import com.splitr.repository.GroupMemberRepository;
import com.splitr.repository.SettlementRepository;
import com.splitr.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    public SettlementService(SettlementRepository settlementRepository,
                             GroupMemberRepository groupMemberRepository,
                             UserRepository userRepository) {
        this.settlementRepository = settlementRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
    }

    public SettlementResponse createSettlement(UUID userId, UUID groupId, SettlementCreateRequest request) {
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this group"));
        Group group = member.getGroup();

        if (userId.equals(request.payeeId())) {
            throw new IllegalArgumentException("Cannot create a settlement with yourself");
        }

        groupMemberRepository.findByGroupIdAndUserId(groupId, request.payeeId())
                .orElseThrow(() -> new IllegalArgumentException("Payee is not a member of this group"));

        User payer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User payee = userRepository.findById(request.payeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Payee not found"));

        Settlement settlement = new Settlement();
        settlement.setGroup(group);
        settlement.setPayer(payer);
        settlement.setPayee(payee);
        settlement.setAmount(request.amount());
        settlement.setCurrency(request.currency() != null ? request.currency() : group.getCurrency());
        settlement.setMethod(request.method());
        settlement.setNotes(request.notes());

        settlement = settlementRepository.save(settlement);
        return mapToResponse(settlement);
    }

    @Transactional(readOnly = true)
    public List<SettlementResponse> listSettlements(UUID userId, UUID groupId) {
        groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this group"));

        return settlementRepository.findByGroupIdOrderBySettledAtDesc(groupId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public void deleteSettlement(UUID userId, UUID settlementId) {
        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement not found"));

        UUID groupId = settlement.getGroup().getId();
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this group"));

        boolean isPayer = settlement.getPayer().getId().equals(userId);
        boolean isPayee = settlement.getPayee().getId().equals(userId);
        boolean isAdmin = member.getRole() == GroupRole.ADMIN;

        if (!isPayer && !isPayee && !isAdmin) {
            throw new UnauthorizedException("Only the payer, payee, or a group admin can delete this settlement");
        }

        settlementRepository.delete(settlement);
    }

    private SettlementResponse mapToResponse(Settlement settlement) {
        return new SettlementResponse(
                settlement.getId(),
                settlement.getGroup().getId(),
                toUserSummary(settlement.getPayer()),
                toUserSummary(settlement.getPayee()),
                settlement.getAmount(),
                settlement.getCurrency(),
                settlement.getMethod(),
                settlement.getNotes(),
                settlement.getSettledAt()
        );
    }

    private UserSummary toUserSummary(User user) {
        return new UserSummary(user.getId(), user.getUsername(), user.getEmail(), user.getAvatarUrl());
    }
}
