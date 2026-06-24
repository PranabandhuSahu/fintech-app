package com.fintech.auth.controller;

import com.fintech.auth.dto.AuthResponse;
import com.fintech.auth.dto.LoginRequest;
import com.fintech.auth.dto.ProfileResponse;
import com.fintech.auth.dto.RegisterRequest;
import com.fintech.auth.exception.ApiException;
import com.fintech.auth.security.JwtUtil;
import com.fintech.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> me(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        Long userId;
        try {
            userId = jwtUtil.getUserId(authHeader.substring(7));
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }
        return ResponseEntity.ok(authService.getProfile(userId));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("auth-service is up");
    }
}
