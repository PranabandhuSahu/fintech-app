package com.fintech.account.repository;

import com.fintech.account.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Account> findByIdAndUserId(Long id, Long userId);

    boolean existsByAccountNumber(String accountNumber);
}
