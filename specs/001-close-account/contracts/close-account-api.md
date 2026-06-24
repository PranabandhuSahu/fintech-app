# Close Account API Contract

## Endpoints exposed by `close-account-service`

All requests must include a valid `Authorization: Bearer <token>` header.

### POST /api/close-account

Close the specified account. If the account has a positive balance, the request must include a destination account to receive the funds.

#### Request

```json
{
  "accountId": 123,
  "destinationAccountId": 456
}
```

- `accountId` (required): The active account to close.
- `destinationAccountId` (optional): Another active account owned by the same customer. Required when `finalBalance > 0`.

#### Response 200 OK

```json
{
  "accountId": 123,
  "accountNumber": "000000123456",
  "status": "CLOSED",
  "finalBalance": 0.00,
  "destinationAccountId": 456,
  "transferredAmount": 150.00,
  "closedAt": "2026-06-24T12:34:56Z"
}
```

#### Response 400 Bad Request

```json
{
  "timestamp": "2026-06-24T12:34:56Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Account has a negative balance. Deposit sufficient funds before closing.",
  "fieldErrors": {}
}
```

#### Response 403 Forbidden

Returned when the authenticated customer does not own the account or the destination account.

#### Response 409 Conflict

Returned when the account is already closed or no active destination account exists for a positive balance.

---

### GET /api/close-account/{accountId}/status

Return the closure status and audit details for an account.

#### Response 200 OK

```json
{
  "accountId": 123,
  "status": "CLOSED",
  "closedAt": "2026-06-24T12:34:56Z",
  "transferredAmount": 150.00
}
```

---

## Internal contract: `close-account-service` → `account-service`

`close-account-service` will consume the following existing or extended `account-service` endpoints. These are internal service calls and are not exposed to the frontend.

### GET /api/accounts/{id}

Retrieve account details including `status` and `balance`.

### POST /api/accounts/transfer

Execute a transfer between accounts owned by the customer when the account being closed has a positive balance.

### POST /api/accounts/{id}/status

**New endpoint** added to `account-service` to update the account status. Request:

```json
{
  "status": "CLOSED"
}
```

Response returns the updated `AccountResponse`.
