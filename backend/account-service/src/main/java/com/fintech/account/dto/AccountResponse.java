package com.fintech.account.dto;

import com.fintech.account.model.Account;

import java.math.BigDecimal;
import java.time.Instant;

public class AccountResponse {

    private Long id;
    private Long userId;
    private String accountNumber;
    private String holderName;
    private String accountType;
    private BigDecimal balance;
    private String status;
    private Instant createdAt;

    public static AccountResponse from(Account account) {
        AccountResponse r = new AccountResponse();
        r.id = account.getId();
        r.userId = account.getUserId();
        r.accountNumber = account.getAccountNumber();
        r.holderName = account.getHolderName();
        r.accountType = account.getAccountType();
        r.balance = account.getBalance();
        r.status = account.getStatus();
        r.createdAt = account.getCreatedAt();
        return r;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getHolderName() {
        return holderName;
    }

    public String getAccountType() {
        return accountType;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public String getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
