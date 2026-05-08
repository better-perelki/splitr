package com.splitr.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record SettlementResponse(
        UUID id,
        UUID groupId,
        UserSummary payer,
        UserSummary payee,
        BigDecimal amount,
        String currency,
        String method,
        String notes,
        Instant settledAt
) {}
