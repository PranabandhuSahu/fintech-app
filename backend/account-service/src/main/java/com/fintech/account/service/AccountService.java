package com.fintech.account.service;

import com.fintech.account.client.TransactionClient;
import com.fintech.account.dto.AccountResponse;
import com.fintech.account.dto.AccountStatusUpdateRequest;
import com.fintech.account.dto.AmountRequest;
import com.fintech.account.dto.OpenAccountRequest;
import com.fintech.account.dto.TransferRequest;
import com.fintech.account.dto.TransferResponse;
import com.fintech.account.exception.ApiException;
import com.fintech.account.model.Account;
import com.fintech.account.repository.AccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class AccountService {

    private static final Set<String> VALID_TYPES = Set.of("SAVINGS", "CHECKING", "CURRENT");
    private final AccountRepository accountRepository;
    private final TransactionClient transactionClient;
    private final SecureRandom random = new SecureRandom();

    public AccountService(AccountRepository accountRepository, TransactionClient transactionClient) {
        this.accountRepository = accountRepository;
        this.transactionClient = transactionClient;
    }

    @Transactional
    public AccountResponse openAccount(Long userId, String username, String authHeader, OpenAccountRequest request) {
        String type = request.getAccountType().toUpperCase();
        if (!VALID_TYPES.contains(type)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Account type must be one of SAVINGS, CHECKING or CURRENT");
        }

        BigDecimal initialDeposit = request.getInitialDeposit() == null ? BigDecimal.ZERO : request.getInitialDeposit();

        Account account = new Account();
        account.setAccountNumber(generateAccountNumber());
        account.setUserId(userId);
        account.setHolderName(
                request.getHolderName() == null || request.getHolderName().isBlank()
                        ? username : request.getHolderName());
        account.setAccountType(type);
        account.setBalance(initialDeposit);
        account.setStatus("ACTIVE");
        Account saved = accountRepository.save(account);

        if (initialDeposit.compareTo(BigDecimal.ZERO) > 0) {
            transactionClient.recordTransaction(authHeader, saved.getId(), saved.getAccountNumber(),
                    "DEPOSIT", initialDeposit, saved.getBalance(), "Initial deposit on account opening");
        }

        return AccountResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getAccounts(Long userId) {
        return accountRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(AccountResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccount(Long userId, Long accountId) {
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found"));
        return AccountResponse.from(account);
    }

    @Transactional
    public AccountResponse deposit(Long userId, String authHeader, Long accountId, AmountRequest request) {
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found"));

        validateAccountActive(account);

        account.setBalance(account.getBalance().add(request.getAmount()));
        Account saved = accountRepository.save(account);

        transactionClient.recordTransaction(authHeader, saved.getId(), saved.getAccountNumber(),
                "DEPOSIT", request.getAmount(), saved.getBalance(),
                description(request.getDescription(), "Deposit"));
        return AccountResponse.from(saved);
    }

    @Transactional
    public AccountResponse withdraw(Long userId, String authHeader, Long accountId, AmountRequest request) {
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found"));

        validateAccountActive(account);

        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Insufficient funds for this withdrawal");
        }

        account.setBalance(account.getBalance().subtract(request.getAmount()));
        Account saved = accountRepository.save(account);

        transactionClient.recordTransaction(authHeader, saved.getId(), saved.getAccountNumber(),
                "WITHDRAWAL", request.getAmount(), saved.getBalance(),
                description(request.getDescription(), "Withdrawal"));
        return AccountResponse.from(saved);
    }

    private void validateAccountActive(Account account) {
        if (Account.STATUS_CLOSED.equalsIgnoreCase(account.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Transactions are not allowed on closed accounts");
        }
    }

    @Transactional
    public AccountResponse updateStatus(Long userId, Long accountId, AccountStatusUpdateRequest request) {
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found"));

        String newStatus = request.getStatus().toUpperCase();
        if (!newStatus.equals(Account.STATUS_ACTIVE) && !newStatus.equals(Account.STATUS_CLOSED)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Account status must be one of ACTIVE or CLOSED");
        }

        if (newStatus.equals(Account.STATUS_ACTIVE) && account.getStatus().equals(Account.STATUS_CLOSED)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Closed accounts cannot be reopened");
        }

        account.setStatus(newStatus);
        return AccountResponse.from(accountRepository.save(account));
    }

    @Transactional
    public TransferResponse transfer(Long userId, String authHeader, TransferRequest request) {
        if (request.getFromAccountId().equals(request.getToAccountId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Source and destination accounts must be different");
        }

        Account source = accountRepository.findByIdAndUserId(request.getFromAccountId(), userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Source account not found"));
        Account destination = accountRepository.findByIdAndUserId(request.getToAccountId(), userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Destination account not found"));

        validateAccountActive(source);
        validateAccountActive(destination);

        if (source.getBalance().compareTo(request.getAmount()) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Insufficient funds in source account");
        }

        String refId = "TRF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String desc = description(request.getDescription(),
                "Transfer to ••" + destination.getAccountNumber().substring(destination.getAccountNumber().length() - 4));
        String descIn = description(request.getDescription(),
                "Transfer from ••" + source.getAccountNumber().substring(source.getAccountNumber().length() - 4));

        source.setBalance(source.getBalance().subtract(request.getAmount()));
        destination.setBalance(destination.getBalance().add(request.getAmount()));
        Account savedSource = accountRepository.save(source);
        Account savedDest = accountRepository.save(destination);

        transactionClient.recordTransaction(authHeader, savedSource.getId(), savedSource.getAccountNumber(),
                "TRANSFER_OUT", request.getAmount(), savedSource.getBalance(), desc);
        transactionClient.recordTransaction(authHeader, savedDest.getId(), savedDest.getAccountNumber(),
                "TRANSFER_IN", request.getAmount(), savedDest.getBalance(), descIn);

        TransferResponse response = new TransferResponse();
        response.setReferenceId(refId);
        response.setFromAccountId(savedSource.getId());
        response.setFromAccountNumber(savedSource.getAccountNumber());
        response.setToAccountId(savedDest.getId());
        response.setToAccountNumber(savedDest.getAccountNumber());
        response.setAmount(request.getAmount());
        response.setDescription(desc);
        response.setFromBalanceAfter(savedSource.getBalance());
        response.setToBalanceAfter(savedDest.getBalance());
        response.setTimestamp(Instant.now());
        return response;
    }

    private String description(String provided, String fallback) {
        return provided == null || provided.isBlank() ? fallback : provided;
    }

    private String generateAccountNumber() {
        String number;
        do {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 12; i++) {
                sb.append(random.nextInt(10));
            }
            number = sb.toString();
        } while (accountRepository.existsByAccountNumber(number));
        return number;
    }
}
