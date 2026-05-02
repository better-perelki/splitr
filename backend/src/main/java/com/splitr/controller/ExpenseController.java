package com.splitr.controller;

import com.splitr.dto.ExpenseCreateRequest;
import com.splitr.dto.ExpenseResponse;
import com.splitr.dto.ExpenseUpdateRequest;
import com.splitr.dto.PagedExpenseResponse;
import com.splitr.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping("/api/groups/{groupId}/expenses")
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseResponse create(Authentication auth,
                                  @PathVariable UUID groupId,
                                  @Valid @RequestBody ExpenseCreateRequest request) {
        return expenseService.createExpense(userId(auth), groupId, request);
    }

    @GetMapping("/api/groups/{groupId}/expenses")
    public PagedExpenseResponse list(Authentication auth,
                                     @PathVariable UUID groupId,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return expenseService.listExpenses(userId(auth), groupId, pageable);
    }

    @GetMapping("/api/expenses/{id}")
    public ExpenseResponse get(Authentication auth, @PathVariable UUID id) {
        return expenseService.getExpense(userId(auth), id);
    }

    @PutMapping("/api/expenses/{id}")
    public ExpenseResponse update(Authentication auth,
                                  @PathVariable UUID id,
                                  @Valid @RequestBody ExpenseUpdateRequest request) {
        return expenseService.updateExpense(userId(auth), id, request);
    }

    @DeleteMapping("/api/expenses/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Authentication auth, @PathVariable UUID id) {
        expenseService.deleteExpense(userId(auth), id);
    }

    @PostMapping("/api/expenses/{id}/attachments")
    public ExpenseResponse uploadReceipt(Authentication auth,
                                         @PathVariable UUID id,
                                         @RequestParam("file") MultipartFile file) {
        return expenseService.uploadReceipt(userId(auth), id, file);
    }

    private UUID userId(Authentication auth) {
        return (UUID) auth.getPrincipal();
    }
}
