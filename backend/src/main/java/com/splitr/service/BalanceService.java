package com.splitr.service;

import com.splitr.dto.*;
import com.splitr.dto.WalletSummaryResponse.GroupBalance;
import com.splitr.dto.WalletSummaryResponse.WalletDebt;
import com.splitr.entity.*;
import com.splitr.repository.ExpenseRepository;
import com.splitr.repository.GroupMemberRepository;
import com.splitr.repository.SettlementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class BalanceService {

    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ExchangeRateService exchangeRateService;
    private final com.splitr.repository.UserRepository userRepository;

    public BalanceService(ExpenseRepository expenseRepository,
                          SettlementRepository settlementRepository,
                          GroupMemberRepository groupMemberRepository,
                          ExchangeRateService exchangeRateService,
                          com.splitr.repository.UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.settlementRepository = settlementRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.exchangeRateService = exchangeRateService;
        this.userRepository = userRepository;
    }

    public WalletSummaryResponse getWalletSummary(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String defaultCurrency = user.getDefaultCurrency();

        BigDecimal totalOwed = BigDecimal.ZERO;
        BigDecimal totalOwe = BigDecimal.ZERO;
        List<WalletDebt> debts = new ArrayList<>();
        List<GroupBalance> groupBalances = new ArrayList<>();

        for (GroupMember membership : groupMemberRepository.findByUserId(userId)) {
            Group group = membership.getGroup();
            UUID groupId = group.getId();
            String currency = group.getCurrency();
            String groupName = group.getName();

            GroupBalanceResponse balance = calculateBalances(groupId);

            BigDecimal userBalance = balance.memberBalances().stream()
                    .filter(mb -> mb.user().id().equals(userId))
                    .map(MemberBalance::balance)
                    .findFirst()
                    .orElse(BigDecimal.ZERO);
            groupBalances.add(new GroupBalance(groupId, userBalance));

            BigDecimal rate = exchangeRateService.getRate(currency, defaultCurrency, LocalDate.now());

            for (BalanceEntry entry : balance.simplifiedDebts()) {
                BigDecimal convertedAmount = entry.amount().multiply(rate).setScale(2, java.math.RoundingMode.HALF_UP);
                if (entry.from().id().equals(userId)) {
                    totalOwe = totalOwe.add(convertedAmount);
                    debts.add(new WalletDebt(groupId, groupName, currency,
                            entry.to(), entry.amount(), "owe"));
                } else if (entry.to().id().equals(userId)) {
                    totalOwed = totalOwed.add(convertedAmount);
                    debts.add(new WalletDebt(groupId, groupName, currency,
                            entry.from(), entry.amount(), "owed"));
                }
            }
        }

        debts.sort(Comparator.comparing(WalletDebt::amount).reversed());

        return new WalletSummaryResponse(totalOwed, totalOwe, debts, groupBalances);
    }

    public GroupBalanceResponse calculateBalances(UUID groupId) {
        Map<UUID, User> memberUsers = groupMemberRepository.findByGroupId(groupId).stream()
                .collect(Collectors.toMap(m -> m.getUser().getId(), GroupMember::getUser));

        Map<UUID, BigDecimal> netBalances = computeNetBalances(groupId);

        List<MemberBalance> memberBalances = memberUsers.entrySet().stream()
                .map(entry -> new MemberBalance(
                        toUserSummary(entry.getValue()),
                        netBalances.getOrDefault(entry.getKey(), BigDecimal.ZERO)
                ))
                .sorted(Comparator.comparing(mb -> mb.balance(), Comparator.reverseOrder()))
                .toList();

        List<BalanceEntry> simplifiedDebts = simplifyDebts(netBalances, memberUsers);

        return new GroupBalanceResponse(groupId, memberBalances, simplifiedDebts);
    }

    Map<UUID, BigDecimal> computeNetBalances(UUID groupId) {
        Map<UUID, BigDecimal> balances = new HashMap<>();

        List<Expense> expenses = expenseRepository.findByGroupId(groupId);
        for (Expense expense : expenses) {
            BigDecimal rate = expense.getExchangeRate() != null ? expense.getExchangeRate() : BigDecimal.ONE;

            for (ExpensePayer payer : expense.getPayers()) {
                UUID userId = payer.getUser().getId();
                BigDecimal converted = payer.getAmount().multiply(rate).setScale(2, java.math.RoundingMode.HALF_UP);
                balances.merge(userId, converted, BigDecimal::add);
            }

            for (ExpenseSplit split : expense.getSplits()) {
                UUID userId = split.getUser().getId();
                BigDecimal converted = split.getAmount().multiply(rate).setScale(2, java.math.RoundingMode.HALF_UP);
                balances.merge(userId, converted.negate(), BigDecimal::add);
            }
        }

        List<Settlement> settlements = settlementRepository.findByGroupId(groupId);
        for (Settlement settlement : settlements) {
            balances.merge(settlement.getPayer().getId(),
                    settlement.getAmount(), BigDecimal::add);
            balances.merge(settlement.getPayee().getId(),
                    settlement.getAmount().negate(), BigDecimal::add);
        }

        return balances;
    }

    List<BalanceEntry> simplifyDebts(Map<UUID, BigDecimal> netBalances, Map<UUID, User> users) {
        List<Map.Entry<UUID, BigDecimal>> creditors = new ArrayList<>();
        List<Map.Entry<UUID, BigDecimal>> debtors = new ArrayList<>();

        BigDecimal threshold = new BigDecimal("0.01");

        for (Map.Entry<UUID, BigDecimal> entry : netBalances.entrySet()) {
            int cmp = entry.getValue().compareTo(BigDecimal.ZERO);
            if (cmp > 0) {
                creditors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), entry.getValue()));
            } else if (cmp < 0) {
                debtors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), entry.getValue().negate()));
            }
        }

        creditors.sort((a, b) -> b.getValue().compareTo(a.getValue()));
        debtors.sort((a, b) -> b.getValue().compareTo(a.getValue()));

        List<BalanceEntry> result = new ArrayList<>();
        int ci = 0, di = 0;

        while (ci < creditors.size() && di < debtors.size()) {
            Map.Entry<UUID, BigDecimal> creditor = creditors.get(ci);
            Map.Entry<UUID, BigDecimal> debtor = debtors.get(di);

            BigDecimal transfer = creditor.getValue().min(debtor.getValue());

            if (transfer.compareTo(threshold) >= 0) {
                User fromUser = users.get(debtor.getKey());
                User toUser = users.get(creditor.getKey());

                if (fromUser != null && toUser != null) {
                    result.add(new BalanceEntry(
                            toUserSummary(fromUser),
                            toUserSummary(toUser),
                            transfer
                    ));
                }
            }

            creditor.setValue(creditor.getValue().subtract(transfer));
            debtor.setValue(debtor.getValue().subtract(transfer));

            if (creditor.getValue().compareTo(threshold) < 0) ci++;
            if (debtor.getValue().compareTo(threshold) < 0) di++;
        }

        return result;
    }

    private UserSummary toUserSummary(User user) {
        return new UserSummary(user.getId(), user.getUsername(), user.getEmail(), user.getAvatarUrl());
    }
}
