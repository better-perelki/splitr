package com.splitr.dto;

import java.util.List;
import java.util.UUID;

public record GroupBalanceResponse(
        UUID groupId,
        List<MemberBalance> memberBalances,
        List<BalanceEntry> simplifiedDebts
) {}
