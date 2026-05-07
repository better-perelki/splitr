package com.splitr.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record SplitInput(
        @NotNull UUID userId,
        BigDecimal amount,
        BigDecimal share,
        BigDecimal percentage,
        BigDecimal adjustment
) {}
