# Close Account — Data Model

## Existing entities (referenced, not modified except where noted)

### Account

- **Source**: `account-service`
- **Purpose**: The bank account owned by a customer.
- **Fields**:
  - `id`: Long (primary key)
  - `accountNumber`: String, unique, non-null
  - `userId`: Long, non-null
  - `holderName`: String, non-null
  - `accountType`: String, non-null (SAVINGS, CHECKING, CURRENT)
  - `balance`: BigDecimal (precision 19, scale 2), non-null
  - `status`: String, non-null — **extended to include `CLOSED`**
  - `createdAt`: Instant, non-null

## New entity

### AccountClosure

- **Source**: `close-account-service`
- **Purpose**: Audit record of every account closure event.
- **Fields**:
  - `id`: Long (primary key)
  - `accountId`: Long, non-null — reference to the account that was closed
  - `accountNumber`: String, non-null — denormalized for audit readability
  - `userId`: Long, non-null — owner who initiated the closure
  - `finalBalance`: BigDecimal, non-null — balance at the moment of closure
  - `destinationAccountId`: Long, nullable — account that received transferred funds
  - `destinationAccountNumber`: String, nullable — denormalized for audit readability
  - `transferredAmount`: BigDecimal, nullable — amount transferred before closure
  - `status`: String, non-null — `COMPLETED` or `FAILED`
  - `reason`: String, nullable — human-readable reason for failure if applicable
  - `closedAt`: Instant, non-null

## Relationships

- An `Account` has zero or one `AccountClosure` records (closure is final, but the record is immutable).
- `AccountClosure` references `Account` by `accountId` but does not enforce a foreign key across services.
- `AccountClosure` may reference a destination `Account` by `destinationAccountId` when a transfer occurred.

## State transitions

- `ACTIVE` → `CLOSED` (final)
- No transition from `CLOSED` to any other state is allowed.
- Deposits and withdrawals are permitted only when `status = ACTIVE`.
