package com.splitr.dto;

import java.util.List;

public record PagedExpenseResponse(
        List<ExpenseResponse> items,
        int page,
        int size,
        long total
) {}
