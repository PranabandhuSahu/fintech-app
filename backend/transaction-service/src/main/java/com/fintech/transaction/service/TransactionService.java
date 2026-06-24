package com.fintech.transaction.service;

import com.fintech.transaction.dto.CreateTransactionRequest;
import com.fintech.transaction.dto.TransactionResponse;
import com.fintech.transaction.model.Transaction;
import com.fintech.transaction.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public TransactionResponse create(Long userId, CreateTransactionRequest request) {
        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setAccountId(request.getAccountId());
        transaction.setAccountNumber(request.getAccountNumber());
        transaction.setType(request.getType().toUpperCase());
        transaction.setAmount(request.getAmount());
        transaction.setBalanceAfter(request.getBalanceAfter());
        transaction.setDescription(request.getDescription());
        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> history(Long userId, Long accountId, Instant from, Instant to) {
        List<Transaction> transactions;
        if (from != null && to != null) {
            transactions = accountId == null
                    ? transactionRepository.findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(userId, from, to)
                    : transactionRepository.findByUserIdAndAccountIdAndCreatedAtBetweenOrderByCreatedAtDesc(userId, accountId, from, to);
        } else {
            transactions = accountId == null
                    ? transactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                    : transactionRepository.findByUserIdAndAccountIdOrderByCreatedAtDesc(userId, accountId);
        }
        return transactions.stream().map(TransactionResponse::from).toList();
    }
}
