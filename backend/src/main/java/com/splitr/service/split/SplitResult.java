package com.splitr.service.split;

import java.math.BigDecimal;
import java.util.UUID;

public record SplitResult(
        UUID userId,
        BigDecimal amount,
        BigDecimal share,
        BigDecimal percentage,
        BigDecimal adjustment
) {}
