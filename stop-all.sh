#!/usr/bin/env bash

set -e

SERVICES=(
  "api-gateway"
  "close-account-service"
  "transaction-service"
  "account-service"
  "auth-service"
  "discovery-server"
)

for service in "${SERVICES[@]}"; do
  pid=$(pgrep -f "${service}-1.0.0.jar" || true)
  if [ -n "$pid" ]; then
    echo "Stopping $service (PID $pid)..."
    kill "$pid" || true
  else
    echo "$service is not running"
  fi
done

echo "All services stopped."
