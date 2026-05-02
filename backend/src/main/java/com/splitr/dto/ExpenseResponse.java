package com.splitr.dto;

import com.splitr.entity.ExpenseCategory;
import com.splitr.entity.SplitType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ExpenseResponse(
        UUID id,
        UUID groupId,
        String description,
        BigDecimal amount,
        String currency,
        ExpenseCategory category,
        LocalDate expenseDate,
        SplitType splitType,
        String receiptUrl,
        String notes,
        UserSummary createdBy,
        Instant createdAt,
        Instant updatedAt,
        List<ExpensePayerResponse> payers,
        List<ExpenseSplitResponse> splits
) {}
