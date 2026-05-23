package com.splitr.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record WalletSummaryResponse(
        BigDecimal totalOwed,
        BigDecimal totalOwe,
        List<WalletDebt> debts,
        List<GroupBalance> groupBalances
) {
    public record WalletDebt(
            UUID groupId,
            String groupName,
            String currency,
            UserSummary counterparty,
            BigDecimal amount,
            String type
    ) {}

    public record GroupBalance(
            UUID groupId,
            BigDecimal balance
    ) {}
}
