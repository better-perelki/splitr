package com.splitr.dto;

import java.math.BigDecimal;
import java.util.List;

public record GroupAnalyticsResponse(
        BigDecimal totalSpent,
        List<CategoryStat> categoryBreakdown,
        List<MonthStat> monthlyTrend,
        List<MemberSpending> memberRanking
) {

    public record CategoryStat(
            String category,
            BigDecimal amount,
            BigDecimal percentage
    ) {}

    public record MonthStat(
            String yearMonth,
            BigDecimal amount
    ) {}

    public record MemberSpending(
            UserSummary user,
            BigDecimal amount,
            BigDecimal percentage
    ) {}
}
