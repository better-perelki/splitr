package com.splitr.repository;

import com.splitr.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    Page<Expense> findByGroupIdOrderByExpenseDateDescCreatedAtDesc(UUID groupId, Pageable pageable);
}
