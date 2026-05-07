package com.splitr.dto;

import com.splitr.entity.ExpenseCategory;
import com.splitr.entity.SplitType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ExpenseCreateRequest(
        @NotNull @Positive BigDecimal amount,
        String currency,
        @NotBlank @Size(max = 255) String description,
        @NotNull LocalDate expenseDate,
        @NotNull ExpenseCategory category,
        @NotNull SplitType splitType,
        @NotEmpty @Valid List<PayerInput> payers,
        @NotEmpty @Valid List<SplitInput> splits,
        String notes
) {}
