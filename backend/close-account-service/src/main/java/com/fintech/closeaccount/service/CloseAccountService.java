package com.fintech.closeaccount.service;

import com.fintech.closeaccount.client.AccountClient;
import com.fintech.closeaccount.dto.AccountClientResponse;
import com.fintech.closeaccount.dto.AccountClientTransferRequest;
import com.fintech.closeaccount.dto.AccountClientTransferResponse;
import com.fintech.closeaccount.dto.CloseAccountRequest;
import com.fintech.closeaccount.dto.CloseAccountResponse;
import com.fintech.closeaccount.exception.ApiException;
import com.fintech.closeaccount.model.AccountClosure;
import com.fintech.closeaccount.repository.AccountClosureRepository;
import com.fintech.closeaccount.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Service
public class CloseAccountService {

    private static final Logger log = LoggerFactory.getLogger(CloseAccountService.class);
    private static final String ACCOUNT_STATUS_CLOSED = "CLOSED";
    private static final String ACCOUNT_STATUS_ACTIVE = "ACTIVE";

    private final AccountClient accountClient;
    private final AccountClosureRepository accountClosureRepository;

    public CloseAccountService(AccountClient accountClient, AccountClosureRepository accountClosureRepository) {
        this.accountClient = accountClient;
        this.accountClosureRepository = accountClosureRepository;
    }

    @Transactional
    public CloseAccountResponse closeAccount(UserPrincipal principal, String authHeader, CloseAccountRequest request) {
        Long userId = principal.getUserId();
        Long accountId = request.getAccountId();

        AccountClientResponse account = accountClient.getAccount(authHeader, accountId);
        validateOwnership(account, userId);
        validateCanClose(account);

        BigDecimal balance = account.getBalance();
        Long destinationAccountId = request.getDestinationAccountId();
        BigDecimal transferredAmount = null;
        String destinationAccountNumber = null;

        if (balance.compareTo(BigDecimal.ZERO) > 0) {
            if (destinationAccountId == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "A destination account is required to transfer the positive balance before closing");
            }
            AccountClientResponse destination = accountClient.getAccount(authHeader, destinationAccountId);
            validateDestination(destination, userId);
            transferredAmount = balance;
            destinationAccountNumber = destination.getAccountNumber();
            transferBalance(authHeader, accountId, destinationAccountId, balance);
        } else if (balance.compareTo(BigDecimal.ZERO) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Account has a negative balance. Deposit sufficient funds before closing.");
        }

        AccountClientResponse closedAccount = accountClient.updateStatus(authHeader, accountId, ACCOUNT_STATUS_CLOSED);

        AccountClosure closure = new AccountClosure();
        closure.setAccountId(accountId);
        closure.setAccountNumber(account.getAccountNumber());
        closure.setUserId(userId);
        closure.setFinalBalance(BigDecimal.ZERO);
        closure.setDestinationAccountId(destinationAccountId);
        closure.setDestinationAccountNumber(destinationAccountNumber);
        closure.setTransferredAmount(transferredAmount);
        closure.setStatus(AccountClosure.STATUS_COMPLETED);
        closure.setClosedAt(Instant.now());
        accountClosureRepository.save(closure);

        log.info("Account {} closed for user {}. Transferred amount: {}", accountId, userId, transferredAmount);

        CloseAccountResponse response = new CloseAccountResponse();
        response.setAccountId(accountId);
        response.setAccountNumber(account.getAccountNumber());
        response.setStatus(closedAccount.getStatus());
        response.setFinalBalance(closedAccount.getBalance());
        response.setDestinationAccountId(destinationAccountId);
        response.setTransferredAmount(transferredAmount);
        response.setClosedAt(closure.getClosedAt());
        return response;
    }

    private void validateOwnership(AccountClientResponse account, Long userId) {
        if (!account.getUserId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this account");
        }
    }

    private void validateCanClose(AccountClientResponse account) {
        if (ACCOUNT_STATUS_CLOSED.equalsIgnoreCase(account.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "Account is already closed");
        }
        if (!ACCOUNT_STATUS_ACTIVE.equalsIgnoreCase(account.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only active accounts can be closed");
        }
    }

    private void validateDestination(AccountClientResponse destination, Long userId) {
        if (!destination.getUserId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own the destination account");
        }
        if (ACCOUNT_STATUS_CLOSED.equalsIgnoreCase(destination.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Destination account is closed");
        }
    }

    private void transferBalance(String authHeader, Long fromAccountId, Long toAccountId, BigDecimal amount) {
        AccountClientTransferRequest transferRequest = new AccountClientTransferRequest();
        transferRequest.setFromAccountId(fromAccountId);
        transferRequest.setToAccountId(toAccountId);
        transferRequest.setAmount(amount);
        transferRequest.setDescription("Account closure balance transfer");
        AccountClientTransferResponse transfer = accountClient.transfer(authHeader, transferRequest);
        log.info("Transferred {} from account {} to account {} for closure",
                transfer.getAmount(), fromAccountId, toAccountId);
    }
}
