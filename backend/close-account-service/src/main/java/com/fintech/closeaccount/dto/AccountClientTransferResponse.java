package com.fintech.closeaccount.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class AccountClientTransferResponse {

    private String referenceId;
    private Long fromAccountId;
    private String fromAccountNumber;
    private Long toAccountId;
    private String toAccountNumber;
    private BigDecimal amount;
    private String description;
    private BigDecimal fromBalanceAfter;
    private BigDecimal toBalanceAfter;
    private Instant timestamp;

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public Long getFromAccountId() {
        return fromAccountId;
    }

    public void setFromAccountId(Long fromAccountId) {
        this.fromAccountId = fromAccountId;
    }

    public String getFromAccountNumber() {
        return fromAccountNumber;
    }

    public void setFromAccountNumber(String fromAccountNumber) {
        this.fromAccountNumber = fromAccountNumber;
    }

    public Long getToAccountId() {
        return toAccountId;
    }

    public void setToAccountId(Long toAccountId) {
        this.toAccountId = toAccountId;
    }

    public String getToAccountNumber() {
        return toAccountNumber;
    }

    public void setToAccountNumber(String toAccountNumber) {
        this.toAccountNumber = toAccountNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getFromBalanceAfter() {
        return fromBalanceAfter;
    }

    public void setFromBalanceAfter(BigDecimal fromBalanceAfter) {
        this.fromBalanceAfter = fromBalanceAfter;
    }

    public BigDecimal getToBalanceAfter() {
        return toBalanceAfter;
    }

    public void setToBalanceAfter(BigDecimal toBalanceAfter) {
        this.toBalanceAfter = toBalanceAfter;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
