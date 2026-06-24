package com.fintech.closeaccount.client;

import com.fintech.closeaccount.dto.AccountClientResponse;
import com.fintech.closeaccount.dto.AccountClientStatusRequest;
import com.fintech.closeaccount.dto.AccountClientTransferRequest;
import com.fintech.closeaccount.dto.AccountClientTransferResponse;
import com.fintech.closeaccount.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Component
public class AccountClient {

    private static final Logger log = LoggerFactory.getLogger(AccountClient.class);
    private static final String ACCOUNT_SERVICE_URL = "http://account-service/api/accounts";

    private final RestTemplate restTemplate;

    public AccountClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public AccountClientResponse getAccount(String authHeader, Long accountId) {
        try {
            HttpEntity<Void> entity = new HttpEntity<>(authHeaders(authHeader));
            ResponseEntity<AccountClientResponse> response = restTemplate.exchange(
                    ACCOUNT_SERVICE_URL + "/" + accountId,
                    HttpMethod.GET,
                    entity,
                    AccountClientResponse.class);
            return response.getBody();
        } catch (HttpClientErrorException ex) {
            log.warn("Failed to fetch account {} from account-service: {}", accountId, ex.getMessage());
            throw new ApiException(HttpStatus.NOT_FOUND, "Account not found");
        }
    }

    public AccountClientTransferResponse transfer(String authHeader, AccountClientTransferRequest request) {
        try {
            HttpHeaders headers = authHeaders(authHeader);
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<AccountClientTransferRequest> entity = new HttpEntity<>(request, headers);
            return restTemplate.postForObject(
                    ACCOUNT_SERVICE_URL + "/transfer",
                    entity,
                    AccountClientTransferResponse.class);
        } catch (HttpClientErrorException ex) {
            log.warn("Failed to transfer funds in account-service: {}", ex.getMessage());
            throw new ApiException(HttpStatus.BAD_REQUEST, "Failed to transfer funds: " + ex.getResponseBodyAsString());
        }
    }

    public AccountClientResponse updateStatus(String authHeader, Long accountId, String status) {
        try {
            HttpHeaders headers = authHeaders(authHeader);
            headers.setContentType(MediaType.APPLICATION_JSON);
            AccountClientStatusRequest request = new AccountClientStatusRequest();
            request.setStatus(status);
            HttpEntity<AccountClientStatusRequest> entity = new HttpEntity<>(request, headers);
            return restTemplate.postForObject(
                    ACCOUNT_SERVICE_URL + "/" + accountId + "/status",
                    entity,
                    AccountClientResponse.class);
        } catch (HttpClientErrorException ex) {
            log.warn("Failed to update status for account {} in account-service: {}", accountId, ex.getMessage());
            throw new ApiException(HttpStatus.BAD_REQUEST, "Failed to close account: " + ex.getResponseBodyAsString());
        }
    }

    private HttpHeaders authHeaders(String authHeader) {
        HttpHeaders headers = new HttpHeaders();
        if (authHeader != null) {
            headers.set(HttpHeaders.AUTHORIZATION, authHeader);
        }
        return headers;
    }
}
