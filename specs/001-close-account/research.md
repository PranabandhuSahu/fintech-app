# Close Account — Research Notes

## Decisions

### 1. New microservice: `close-account-service`

- **Decision**: Create a dedicated `close-account-service` microservice rather than adding the feature to `account-service`.
- **Rationale**: The feature request explicitly requires a new microservice. This service isolates the closure orchestration, audit logging, and state transition from ongoing account operations. It also provides a clear boundary for future closure-related rules (e.g., retention policies, regulatory reporting).
- **Alternatives considered**: Implementing closure entirely inside `account-service`. Rejected because it does not satisfy the explicit requirement and would blur the boundary between account lifecycle management and closure auditing.

### 2. `account-service` remains the source of truth for account data

- **Decision**: `close-account-service` will call `account-service` to query account status/balance, execute transfers, and update account status to `CLOSED`.
- **Rationale**: Keeps account ownership and balance logic centralized. Prevents data duplication and eventual consistency issues between services.
- **Alternatives considered**: Replicating account data in `close-account-service`. Rejected because it introduces synchronization complexity and contradicts the existing database-per-service pattern.

### 3. Closure status value: `CLOSED`

- **Decision**: Extend the `Account.status` enum/string values from `ACTIVE` to include `CLOSED`.
- **Rationale**: A simple, explicit status value is the most reliable way to prevent transactions and reopening across the backend and frontend.
- **Alternatives considered**: Boolean `closed` flag. Rejected because a status field is more extensible (e.g., future `FROZEN`, `PENDING` states) and matches the existing `status` column pattern.

### 4. Frontend flow: inline popup for balance transfer

- **Decision**: When closing an account with a positive balance, show a popup within the account details page that lets the user select a destination account and confirm the transfer.
- **Rationale**: Reuses the existing transfer pattern and keeps the user on the same page, minimizing navigation and cognitive load.
- **Alternatives considered**: Redirect to the existing Transfer page. Rejected because it breaks the closure flow and requires the user to remember to return and close the account afterward.

### 5. No reopen option

- **Decision**: Closed accounts cannot be reopened by the customer or any UI action. Reopening is out of scope for this feature.
- **Rationale**: Matches the requirement explicitly stated in the feature description. Reopening would require a separate business process and approval workflow.
