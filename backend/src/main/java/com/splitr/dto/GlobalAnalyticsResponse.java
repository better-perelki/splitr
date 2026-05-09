package com.splitr.dto;

import java.math.BigDecimal;
import java.util.List;

public record GlobalAnalyticsResponse(
        BigDecimal totalSpent,
        BigDecimal youOwe,
        BigDecimal owedToYou,
        long settlementsCount,
        List<GroupAnalyticsResponse.CategoryStat> categoryBreakdown,
        List<GroupAnalyticsResponse.MonthStat> monthlyTrend,
        List<GroupAnalyticsResponse.MemberSpending> memberRanking
) {}
