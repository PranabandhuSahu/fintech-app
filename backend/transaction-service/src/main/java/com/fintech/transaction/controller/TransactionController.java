package com.fintech.transaction.controller;

import com.fintech.transaction.dto.CreateTransactionRequest;
import com.fintech.transaction.dto.TransactionResponse;
import com.fintech.transaction.security.UserPrincipal;
import com.fintech.transaction.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateTransactionRequest request) {
        TransactionResponse response = transactionService.create(principal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> history(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        Instant fromInstant = null;
        Instant toInstant = null;
        if (from != null && !from.isBlank()) {
            fromInstant = LocalDate.parse(from).atStartOfDay(ZoneOffset.UTC).toInstant();
        }
        if (to != null && !to.isBlank()) {
            toInstant = LocalDate.parse(to).plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        }
        return ResponseEntity.ok(transactionService.history(principal.getUserId(), accountId, fromInstant, toInstant));
    }
}
