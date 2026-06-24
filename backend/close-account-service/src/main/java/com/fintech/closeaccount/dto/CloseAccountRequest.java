package com.fintech.closeaccount.dto;

import jakarta.validation.constraints.NotNull;

public class CloseAccountRequest {

    @NotNull(message = "Account ID is required")
    private Long accountId;

    private Long destinationAccountId;

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public Long getDestinationAccountId() {
        return destinationAccountId;
    }

    public void setDestinationAccountId(Long destinationAccountId) {
        this.destinationAccountId = destinationAccountId;
    }
}
