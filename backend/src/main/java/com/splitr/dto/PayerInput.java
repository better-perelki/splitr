package com.splitr.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record PayerInput(
        @NotNull UUID userId,
        @NotNull @Positive BigDecimal amount
) {}
