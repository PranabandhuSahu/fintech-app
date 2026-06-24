#!/usr/bin/env bash

set -e

LOGS_DIR="logs"
mkdir -p "$LOGS_DIR"

echo "Starting discovery-server..."
java -jar backend/discovery-server/target/discovery-server-1.0.0.jar > "$LOGS_DIR/discovery-server.log" 2>&1 &

echo "Waiting for discovery server to register..."
sleep 15

echo "Starting auth-service..."
java -jar backend/auth-service/target/auth-service-1.0.0.jar > "$LOGS_DIR/auth-service.log" 2>&1 &

echo "Starting account-service..."
java -jar backend/account-service/target/account-service-1.0.0.jar > "$LOGS_DIR/account-service.log" 2>&1 &

echo "Starting transaction-service..."
java -jar backend/transaction-service/target/transaction-service-1.0.0.jar > "$LOGS_DIR/transaction-service.log" 2>&1 &

echo "Starting close-account-service..."
java -jar backend/close-account-service/target/close-account-service-1.0.0.jar > "$LOGS_DIR/close-account-service.log" 2>&1 &

echo "Waiting for services to register..."
sleep 15

echo "Starting api-gateway..."
java -jar backend/api-gateway/target/api-gateway-1.0.0.jar > "$LOGS_DIR/api-gateway.log" 2>&1 &

echo "All services started. Logs are in ./logs"
