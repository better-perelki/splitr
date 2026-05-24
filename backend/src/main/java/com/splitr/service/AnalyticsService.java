package com.splitr.service;

import com.splitr.dto.GlobalAnalyticsResponse;
import com.splitr.dto.GroupAnalyticsResponse;
import com.splitr.dto.GroupAnalyticsResponse.CategoryStat;
import com.splitr.dto.GroupAnalyticsResponse.MemberSpending;
import com.splitr.dto.GroupAnalyticsResponse.MonthStat;
import com.splitr.dto.UserSummary;
import com.splitr.entity.*;
import com.splitr.exception.UnauthorizedException;
import com.splitr.repository.ExpenseRepository;
import com.splitr.repository.GroupMemberRepository;
import com.splitr.repository.SettlementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final ExpenseRepository expenseRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final BalanceService balanceService;
    private final SettlementRepository settlementRepository;
    private final ExchangeRateService exchangeRateService;
    private final com.splitr.repository.UserRepository userRepository;

    public AnalyticsService(ExpenseRepository expenseRepository,
                            GroupMemberRepository groupMemberRepository,
                            BalanceService balanceService,
                            SettlementRepository settlementRepository,
                            ExchangeRateService exchangeRateService,
                            com.splitr.repository.UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.balanceService = balanceService;
        this.settlementRepository = settlementRepository;
        this.exchangeRateService = exchangeRateService;
        this.userRepository = userRepository;
    }

    public GlobalAnalyticsResponse getGlobalAnalytics(UUID userId, LocalDate from, LocalDate to) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String defaultCurrency = user.getDefaultCurrency();

        List<GroupMember> memberships = groupMemberRepository.findByUserId(userId);
        Map<UUID, BigDecimal> groupRates = new HashMap<>();

        // Collect expenses from all groups
        List<Expense> allExpenses = new ArrayList<>();
        for (GroupMember gm : memberships) {
            UUID groupId = gm.getGroup().getId();
            String currency = gm.getGroup().getCurrency();
            groupRates.put(groupId, exchangeRateService.getRate(currency, defaultCurrency, LocalDate.now()));

            allExpenses.addAll(
                    expenseRepository.findByGroupIdAndExpenseDateBetween(groupId, from, to)
            );
        }

        BigDecimal totalSpent = allExpenses.stream()
                .map(e -> {
                    BigDecimal amt = e.getConvertedAmount() != null ? e.getConvertedAmount() : e.getAmount();
                    return amt.multiply(groupRates.getOrDefault(e.getGroup().getId(), BigDecimal.ONE));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Compute youOwe / owedToYou across all groups
        BigDecimal youOwe = BigDecimal.ZERO;
        BigDecimal owedToYou = BigDecimal.ZERO;
        for (GroupMember gm : memberships) {
            UUID groupId = gm.getGroup().getId();
            BigDecimal rate = groupRates.getOrDefault(groupId, BigDecimal.ONE);
            Map<UUID, BigDecimal> netBalances = balanceService.computeNetBalances(groupId);
            BigDecimal userBalance = netBalances.getOrDefault(userId, BigDecimal.ZERO).multiply(rate);
            if (userBalance.signum() < 0) {
                youOwe = youOwe.add(userBalance.negate());
            } else {
                owedToYou = owedToYou.add(userBalance);
            }
        }

        // Count settlements across all groups
        long settlementsCount = 0;
        for (GroupMember gm : memberships) {
            settlementsCount += settlementRepository.findByGroupId(gm.getGroup().getId()).stream()
                    .filter(s -> s.getPayer().getId().equals(userId) || s.getPayee().getId().equals(userId))
                    .count();
        }

        List<CategoryStat> categoryBreakdown = buildCategoryBreakdown(allExpenses, totalSpent, groupRates);
        List<MonthStat> monthlyTrend = buildMonthlyTrend(allExpenses, from, to, groupRates);
        List<MemberSpending> memberRanking = buildMemberRanking(allExpenses, totalSpent, groupRates);

        return new GlobalAnalyticsResponse(
                totalSpent, youOwe, owedToYou, settlementsCount,
                categoryBreakdown, monthlyTrend, memberRanking
        );
    }

    public GroupAnalyticsResponse getAnalytics(UUID userId, UUID groupId, LocalDate from, LocalDate to) {
        // Verify membership
        groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this group"));

        List<Expense> expenses = expenseRepository.findByGroupIdAndExpenseDateBetween(groupId, from, to);

        BigDecimal totalSpent = expenses.stream()
                .map(e -> e.getConvertedAmount() != null ? e.getConvertedAmount() : e.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CategoryStat> categoryBreakdown = buildCategoryBreakdown(expenses, totalSpent, null);
        List<MonthStat> monthlyTrend = buildMonthlyTrend(expenses, from, to, null);
        List<MemberSpending> memberRanking = buildMemberRanking(expenses, totalSpent, null);

        return new GroupAnalyticsResponse(totalSpent, categoryBreakdown, monthlyTrend, memberRanking);
    }

    private List<CategoryStat> buildCategoryBreakdown(List<Expense> expenses, BigDecimal totalSpent, Map<UUID, BigDecimal> groupRates) {
        Map<ExpenseCategory, BigDecimal> byCategory = new EnumMap<>(ExpenseCategory.class);
        for (Expense expense : expenses) {
            BigDecimal amt = expense.getConvertedAmount() != null ? expense.getConvertedAmount() : expense.getAmount();
            if (groupRates != null) {
                BigDecimal rate = groupRates.getOrDefault(expense.getGroup().getId(), BigDecimal.ONE);
                amt = amt.multiply(rate).setScale(2, RoundingMode.HALF_UP);
            }
            byCategory.merge(expense.getCategory(), amt, BigDecimal::add);
        }

        return byCategory.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .map(entry -> new CategoryStat(
                        entry.getKey().name(),
                        entry.getValue(),
                        totalSpent.signum() == 0
                                ? BigDecimal.ZERO
                                : entry.getValue()
                                    .multiply(BigDecimal.valueOf(100))
                                    .divide(totalSpent, 1, RoundingMode.HALF_UP)
                ))
                .toList();
    }

    private List<MonthStat> buildMonthlyTrend(List<Expense> expenses, LocalDate from, LocalDate to, Map<UUID, BigDecimal> groupRates) {
        // Pre-populate all months in range so the frontend gets zero-value entries too
        Map<YearMonth, BigDecimal> byMonth = new LinkedHashMap<>();
        YearMonth start = YearMonth.from(from);
        YearMonth end = YearMonth.from(to);
        for (YearMonth ym = start; !ym.isAfter(end); ym = ym.plusMonths(1)) {
            byMonth.put(ym, BigDecimal.ZERO);
        }

        for (Expense expense : expenses) {
            YearMonth ym = YearMonth.from(expense.getExpenseDate());
            BigDecimal amt = expense.getConvertedAmount() != null ? expense.getConvertedAmount() : expense.getAmount();
            if (groupRates != null) {
                BigDecimal rate = groupRates.getOrDefault(expense.getGroup().getId(), BigDecimal.ONE);
                amt = amt.multiply(rate).setScale(2, RoundingMode.HALF_UP);
            }
            byMonth.merge(ym, amt, BigDecimal::add);
        }

        return byMonth.entrySet().stream()
                .map(entry -> new MonthStat(entry.getKey().toString(), entry.getValue()))
                .toList();
    }

    private List<MemberSpending> buildMemberRanking(List<Expense> expenses, BigDecimal totalSpent, Map<UUID, BigDecimal> groupRates) {
        Map<UUID, BigDecimal> byPayer = new LinkedHashMap<>();
        Map<UUID, User> payerUsers = new HashMap<>();

        for (Expense expense : expenses) {
            BigDecimal expenseRate = expense.getExchangeRate() != null ? expense.getExchangeRate() : BigDecimal.ONE;
            BigDecimal groupRate = groupRates != null ? groupRates.getOrDefault(expense.getGroup().getId(), BigDecimal.ONE) : BigDecimal.ONE;
            BigDecimal finalRate = expenseRate.multiply(groupRate);

            for (ExpensePayer payer : expense.getPayers()) {
                UUID uid = payer.getUser().getId();
                BigDecimal converted = payer.getAmount().multiply(finalRate).setScale(2, RoundingMode.HALF_UP);
                byPayer.merge(uid, converted, BigDecimal::add);
                payerUsers.putIfAbsent(uid, payer.getUser());
            }
        }

        return byPayer.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .map(entry -> {
                    User user = payerUsers.get(entry.getKey());
                    BigDecimal pct = totalSpent.signum() == 0
                            ? BigDecimal.ZERO
                            : entry.getValue()
                                .multiply(BigDecimal.valueOf(100))
                                .divide(totalSpent, 1, RoundingMode.HALF_UP);
                    return new MemberSpending(toUserSummary(user), entry.getValue(), pct);
                })
                .toList();
    }

    private UserSummary toUserSummary(User user) {
        return new UserSummary(user.getId(), user.getUsername(), user.getEmail(), user.getAvatarUrl());
    }
}
