package com.splitr.dto;

import java.math.BigDecimal;

public record ExpenseSplitResponse(
        UserSummary user,
        BigDecimal amount,
        BigDecimal share,
        BigDecimal percentage,
        BigDecimal adjustment
) {}
