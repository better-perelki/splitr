package com.splitr.dto;

import com.splitr.entity.GroupType;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record GroupDetailsResponse(
    UUID id,
    String name,
    String icon,
    String currency,
    GroupType type,
    BigDecimal balance,
    List<GroupMemberResponse> members
) {}
