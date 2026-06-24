# Close Account — Quickstart Validation Guide

This guide documents how to validate the Close Account feature end-to-end once it is implemented.

## Prerequisites

- All backend services are running: `discovery-server`, `auth-service`, `account-service`, `close-account-service`, `api-gateway`.
- Frontend is running and pointing to the gateway at `http://localhost:8080`.
- At least one customer is registered and logged in.

## Scenario 1: Close an account with zero balance

1. Log in as a customer with at least one active account that has a zero balance.
2. Navigate to the Dashboard and click the zero-balance account.
3. On the Account Detail page, click **Close Account**.
4. Confirm the closure in the confirmation dialog.
5. **Expected outcome**: The account status changes to `CLOSED`, the page returns to the Dashboard, and a toast message confirms the closure.
6. Click the closed account in the Dashboard.
7. **Expected outcome**: The Account Detail page shows `CLOSED` status and hides the Deposit, Withdraw, and Close Account buttons.

## Scenario 2: Close an account with a positive balance

1. Log in as a customer with at least two active accounts, one with a positive balance.
2. Navigate to the Dashboard and click the account with the positive balance.
3. On the Account Detail page, click **Close Account**.
4. **Expected outcome**: A popup appears stating the account has a positive balance and offering a destination account selection.
5. Select the destination account and confirm the transfer.
6. **Expected outcome**: The positive balance is transferred, the source account is marked `CLOSED`, and the destination account reflects the transferred amount.
7. Return to the source account detail page.
8. **Expected outcome**: The closed account shows the final balance of `0.00` and the transaction history includes the transfer-out entry.

## Scenario 3: Prevent transactions on a closed account

1. Open the Account Detail page for a closed account.
2. **Expected outcome**: The Deposit, Withdraw, and Close Account buttons are not visible.
3. Attempt to access a direct deposit or withdraw URL for the closed account.
4. **Expected outcome**: The backend returns a `400` or `409` error with a message indicating the account is closed.

## Scenario 4: Validation edge cases

1. Attempt to close an account with a negative balance.
   - **Expected outcome**: The system displays an error instructing the customer to deposit funds first.
2. Attempt to close an account with a positive balance when the customer has only one active account.
   - **Expected outcome**: The system displays a message directing the customer to open another account first.
3. Attempt to close an account that is already closed.
   - **Expected outcome**: The system returns a conflict error indicating the account is already closed.

## Run commands

```bash
# Backend (from backend/)
mvn -DskipTests clean package

# Start services in order
java -jar discovery-server/target/discovery-server-1.0.0.jar
java -jar auth-service/target/auth-service-1.0.0.jar
java -jar account-service/target/account-service-1.0.0.jar
java -jar close-account-service/target/close-account-service-1.0.0.jar
java -jar api-gateway/target/api-gateway-1.0.0.jar

# Frontend (from frontend/)
npm install
npm run dev
```

Open the application at `http://localhost:5173` and follow the scenarios above.
