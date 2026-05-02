package com.splitr.dto;

import java.math.BigDecimal;

public record ExpensePayerResponse(
        UserSummary user,
        BigDecimal amount
) {}
