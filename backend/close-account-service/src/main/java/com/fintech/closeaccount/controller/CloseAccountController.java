package com.fintech.closeaccount.controller;

import com.fintech.closeaccount.dto.CloseAccountRequest;
import com.fintech.closeaccount.dto.CloseAccountResponse;
import com.fintech.closeaccount.security.UserPrincipal;
import com.fintech.closeaccount.service.CloseAccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/close-account")
public class CloseAccountController {

    private final CloseAccountService closeAccountService;

    public CloseAccountController(CloseAccountService closeAccountService) {
        this.closeAccountService = closeAccountService;
    }

    @PostMapping
    public ResponseEntity<CloseAccountResponse> closeAccount(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @Valid @RequestBody CloseAccountRequest request) {
        CloseAccountResponse response = closeAccountService.closeAccount(principal, authHeader, request);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
