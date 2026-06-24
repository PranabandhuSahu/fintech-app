package com.fintech.account.controller;

import com.fintech.account.dto.AccountResponse;
import com.fintech.account.dto.AmountRequest;
import com.fintech.account.dto.OpenAccountRequest;
import com.fintech.account.dto.TransferRequest;
import com.fintech.account.dto.TransferResponse;
import com.fintech.account.security.UserPrincipal;
import com.fintech.account.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public ResponseEntity<AccountResponse> openAccount(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @Valid @RequestBody OpenAccountRequest request) {
        AccountResponse response = accountService.openAccount(
                principal.getUserId(), principal.getUsername(), authHeader, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAccounts(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(accountService.getAccounts(principal.getUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccount(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccount(principal.getUserId(), id));
    }

    @PostMapping("/{id}/deposit")
    public ResponseEntity<AccountResponse> deposit(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable Long id,
            @Valid @RequestBody AmountRequest request) {
        return ResponseEntity.ok(accountService.deposit(principal.getUserId(), authHeader, id, request));
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<AccountResponse> withdraw(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable Long id,
            @Valid @RequestBody AmountRequest request) {
        return ResponseEntity.ok(accountService.withdraw(principal.getUserId(), authHeader, id, request));
    }

    @PostMapping("/transfer")
    public ResponseEntity<TransferResponse> transfer(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @Valid @RequestBody TransferRequest request) {
        return ResponseEntity.ok(accountService.transfer(principal.getUserId(), authHeader, request));
    }
}
