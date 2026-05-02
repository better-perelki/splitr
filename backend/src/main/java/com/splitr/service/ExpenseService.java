package com.splitr.service;

import com.splitr.dto.*;
import com.splitr.entity.*;
import com.splitr.exception.ResourceNotFoundException;
import com.splitr.exception.UnauthorizedException;
import com.splitr.repository.ExpenseRepository;
import com.splitr.repository.GroupMemberRepository;
import com.splitr.repository.UserRepository;
import com.splitr.service.split.SplitResult;
import com.splitr.service.split.SplitStrategy;
import com.splitr.service.split.SplitStrategyFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final SplitStrategyFactory splitStrategyFactory;
    private final FileStorageService fileStorageService;

    public ExpenseService(ExpenseRepository expenseRepository,
                          GroupMemberRepository groupMemberRepository,
                          UserRepository userRepository,
                          SplitStrategyFactory splitStrategyFactory,
                          FileStorageService fileStorageService) {
        this.expenseRepository = expenseRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
        this.splitStrategyFactory = splitStrategyFactory;
        this.fileStorageService = fileStorageService;
    }

    public ExpenseResponse createExpense(UUID userId, UUID groupId, ExpenseCreateRequest request) {
        Group group = getGroupIfMember(groupId, userId);
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Set<UUID> memberIds = collectMemberIds(groupId);
        validatePayers(request.payers(), request.amount(), memberIds);
        validateSplitParticipants(request.splits(), memberIds);

        SplitStrategy strategy = splitStrategyFactory.forType(request.splitType());
        List<SplitResult> calculated = strategy.calculate(request.amount(), request.splits());

        Expense expense = new Expense();
        expense.setGroup(group);
        expense.setCreatedBy(creator);
        expense.setDescription(request.description());
        expense.setAmount(request.amount());
        expense.setCurrency(request.currency() != null ? request.currency() : group.getCurrency());
        expense.setCategory(request.category());
        expense.setExpenseDate(request.expenseDate());
        expense.setSplitType(request.splitType());
        expense.setNotes(request.notes());

        attachPayers(expense, request.payers());
        attachSplits(expense, calculated);

        expense = expenseRepository.save(expense);
        return mapToResponse(expense);
    }

    @Transactional(readOnly = true)
    public PagedExpenseResponse listExpenses(UUID userId, UUID groupId, Pageable pageable) {
        getGroupIfMember(groupId, userId);
        Page<Expense> page = expenseRepository
                .findByGroupIdOrderByExpenseDateDescCreatedAtDesc(groupId, pageable);
        return new PagedExpenseResponse(
                page.map(this::mapToResponse).getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public ExpenseResponse getExpense(UUID userId, UUID expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        getGroupIfMember(expense.getGroup().getId(), userId);
        return mapToResponse(expense);
    }

    public ExpenseResponse updateExpense(UUID userId, UUID expenseId, ExpenseUpdateRequest request) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        ensureCanEdit(expense, userId);

        UUID groupId = expense.getGroup().getId();
        Set<UUID> memberIds = collectMemberIds(groupId);
        validatePayers(request.payers(), request.amount(), memberIds);
        validateSplitParticipants(request.splits(), memberIds);

        SplitStrategy strategy = splitStrategyFactory.forType(request.splitType());
        List<SplitResult> calculated = strategy.calculate(request.amount(), request.splits());

        expense.setDescription(request.description());
        expense.setAmount(request.amount());
        expense.setCurrency(request.currency() != null ? request.currency() : expense.getCurrency());
        expense.setCategory(request.category());
        expense.setExpenseDate(request.expenseDate());
        expense.setSplitType(request.splitType());
        expense.setNotes(request.notes());

        expense.getPayers().clear();
        expense.getSplits().clear();
        attachPayers(expense, request.payers());
        attachSplits(expense, calculated);

        expense = expenseRepository.save(expense);
        return mapToResponse(expense);
    }

    public void deleteExpense(UUID userId, UUID expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        ensureCanEdit(expense, userId);
        expenseRepository.delete(expense);
    }

    public ExpenseResponse uploadReceipt(UUID userId, UUID expenseId, MultipartFile file) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        ensureCanEdit(expense, userId);

        String url = fileStorageService.store(file, "receipts/" + expense.getId());
        expense.setReceiptUrl(url);
        expense = expenseRepository.save(expense);
        return mapToResponse(expense);
    }

    private Group getGroupIfMember(UUID groupId, UUID userId) {
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this group"));
        return member.getGroup();
    }

    private void ensureCanEdit(Expense expense, UUID userId) {
        UUID groupId = expense.getGroup().getId();
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this group"));

        boolean isCreator = expense.getCreatedBy().getId().equals(userId);
        boolean isAdmin = member.getRole() == GroupRole.ADMIN;
        boolean isPayer = expense.getPayers().stream()
                .anyMatch(p -> p.getUser().getId().equals(userId));

        if (!isCreator && !isAdmin && !isPayer) {
            throw new UnauthorizedException("Only the creator, a payer, or a group admin can modify this expense");
        }
    }

    private Set<UUID> collectMemberIds(UUID groupId) {
        return groupMemberRepository.findByGroupId(groupId).stream()
                .map(m -> m.getUser().getId())
                .collect(java.util.stream.Collectors.toCollection(HashSet::new));
    }

    private void validatePayers(List<PayerInput> payers, BigDecimal expenseTotal, Set<UUID> memberIds) {
        if (payers == null || payers.isEmpty()) {
            throw new IllegalArgumentException("At least one payer is required");
        }
        Set<UUID> seen = new HashSet<>();
        BigDecimal sum = BigDecimal.ZERO;
        for (PayerInput payer : payers) {
            if (!memberIds.contains(payer.userId())) {
                throw new IllegalArgumentException("Payer is not a member of the group");
            }
            if (!seen.add(payer.userId())) {
                throw new IllegalArgumentException("Duplicate payer entries are not allowed");
            }
            if (payer.amount() == null || payer.amount().signum() <= 0) {
                throw new IllegalArgumentException("Payer amount must be positive");
            }
            sum = sum.add(payer.amount());
        }
        if (sum.compareTo(expenseTotal) != 0) {
            throw new IllegalArgumentException(
                    "Sum of payer amounts (" + sum.toPlainString() +
                            ") must equal expense total (" + expenseTotal.toPlainString() + ")");
        }
    }

    private void validateSplitParticipants(List<SplitInput> splits, Set<UUID> memberIds) {
        if (splits == null || splits.isEmpty()) {
            throw new IllegalArgumentException("At least one split participant is required");
        }
        Set<UUID> seen = new HashSet<>();
        for (SplitInput split : splits) {
            if (!memberIds.contains(split.userId())) {
                throw new IllegalArgumentException("Split participant is not a member of the group");
            }
            if (!seen.add(split.userId())) {
                throw new IllegalArgumentException("Duplicate split entries are not allowed");
            }
        }
    }

    private void attachPayers(Expense expense, List<PayerInput> payerInputs) {
        Map<UUID, User> users = loadUsers(payerInputs.stream().map(PayerInput::userId).toList());
        for (PayerInput input : payerInputs) {
            ExpensePayer payer = new ExpensePayer();
            payer.setExpense(expense);
            payer.setUser(users.get(input.userId()));
            payer.setAmount(input.amount());
            expense.getPayers().add(payer);
        }
    }

    private void attachSplits(Expense expense, List<SplitResult> results) {
        Map<UUID, User> users = loadUsers(results.stream().map(SplitResult::userId).toList());
        for (SplitResult r : results) {
            ExpenseSplit split = new ExpenseSplit();
            split.setExpense(expense);
            split.setUser(users.get(r.userId()));
            split.setAmount(r.amount());
            split.setShare(r.share());
            split.setPercentage(r.percentage());
            split.setAdjustment(r.adjustment());
            expense.getSplits().add(split);
        }
    }

    private Map<UUID, User> loadUsers(List<UUID> ids) {
        Map<UUID, User> map = new HashMap<>();
        for (UUID id : new HashSet<>(ids)) {
            User u = userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
            map.put(id, u);
        }
        return map;
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        List<ExpensePayerResponse> payers = expense.getPayers().stream()
                .map(p -> new ExpensePayerResponse(toUserSummary(p.getUser()), p.getAmount()))
                .toList();
        List<ExpenseSplitResponse> splits = expense.getSplits().stream()
                .map(s -> new ExpenseSplitResponse(
                        toUserSummary(s.getUser()),
                        s.getAmount(),
                        s.getShare(),
                        s.getPercentage(),
                        s.getAdjustment()))
                .toList();
        return new ExpenseResponse(
                expense.getId(),
                expense.getGroup().getId(),
                expense.getDescription(),
                expense.getAmount(),
                expense.getCurrency(),
                expense.getCategory(),
                expense.getExpenseDate(),
                expense.getSplitType(),
                expense.getReceiptUrl(),
                expense.getNotes(),
                toUserSummary(expense.getCreatedBy()),
                expense.getCreatedAt(),
                expense.getUpdatedAt(),
                payers,
                splits
        );
    }

    private UserSummary toUserSummary(User user) {
        return new UserSummary(user.getId(), user.getUsername(), user.getEmail(), user.getAvatarUrl());
    }
}
