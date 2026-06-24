package com.fintech.account.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
public class TransactionClient {

    private static final Logger log = LoggerFactory.getLogger(TransactionClient.class);
    private static final String TRANSACTION_URL = "http://transaction-service/api/transactions";

    private final RestTemplate restTemplate;

    public TransactionClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void recordTransaction(String authHeader, Long accountId, String accountNumber,
                                  String type, BigDecimal amount, BigDecimal balanceAfter, String description) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (authHeader != null) {
                headers.set(HttpHeaders.AUTHORIZATION, authHeader);
            }
            Map<String, Object> body = new HashMap<>();
            body.put("accountId", accountId);
            body.put("accountNumber", accountNumber);
            body.put("type", type);
            body.put("amount", amount);
            body.put("balanceAfter", balanceAfter);
            body.put("description", description);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(TRANSACTION_URL, entity, Void.class);
        } catch (Exception ex) {
            log.warn("Failed to record transaction in transaction-service: {}", ex.getMessage());
        }
    }
}
