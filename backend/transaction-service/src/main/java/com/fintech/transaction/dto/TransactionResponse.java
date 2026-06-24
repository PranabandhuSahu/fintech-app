package com.fintech.transaction.dto;

import com.fintech.transaction.model.Transaction;

import java.math.BigDecimal;
import java.time.Instant;

public class TransactionResponse {

    private Long id;
    private Long accountId;
    private String accountNumber;
    private String type;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private String description;
    private Instant createdAt;

    public static TransactionResponse from(Transaction t) {
        TransactionResponse r = new TransactionResponse();
        r.id = t.getId();
        r.accountId = t.getAccountId();
        r.accountNumber = t.getAccountNumber();
        r.type = t.getType();
        r.amount = t.getAmount();
        r.balanceAfter = t.getBalanceAfter();
        r.description = t.getDescription();
        r.createdAt = t.getCreatedAt();
        return r;
    }

    public Long getId() {
        return id;
    }

    public Long getAccountId() {
        return accountId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getType() {
        return type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public BigDecimal getBalanceAfter() {
        return balanceAfter;
    }

    public String getDescription() {
        return description;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
