package com.splitr.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record SettlementCreateRequest(
        @NotNull UUID payeeId,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
        String currency,
        String method,
        String notes
) {}
