package com.splitr.dto;

import java.math.BigDecimal;

public record MemberBalance(
        UserSummary user,
        BigDecimal balance
) {}
