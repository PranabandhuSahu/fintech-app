package com.fintech.transaction.repository;

import com.fintech.transaction.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Transaction> findByUserIdAndAccountIdOrderByCreatedAtDesc(Long userId, Long accountId);

    List<Transaction> findByUserIdAndAccountIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long userId, Long accountId, Instant from, Instant to);

    List<Transaction> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long userId, Instant from, Instant to);
}
