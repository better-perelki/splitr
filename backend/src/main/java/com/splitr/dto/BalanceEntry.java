package com.splitr.dto;

import java.math.BigDecimal;

public record BalanceEntry(
        UserSummary from,
        UserSummary to,
        BigDecimal amount
) {}
