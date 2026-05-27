package com.splitr.dto;

import com.splitr.entity.GroupType;
import java.math.BigDecimal;
import java.util.UUID;

public record GroupResponse(
    UUID id,
    String name,
    String icon,
    GroupType type,
    BigDecimal balance // Mocked for now
) {}
