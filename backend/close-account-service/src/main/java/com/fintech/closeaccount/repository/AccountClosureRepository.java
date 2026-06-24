package com.fintech.closeaccount.repository;

import com.fintech.closeaccount.model.AccountClosure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountClosureRepository extends JpaRepository<AccountClosure, Long> {

    Optional<AccountClosure> findByAccountId(Long accountId);
}
