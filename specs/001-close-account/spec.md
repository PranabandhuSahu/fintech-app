# Feature Specification: Close Account

**Feature Branch**: `[001-close-account]`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "Fintech-app is a banking application which has few simple functionalities like open account, deposit, withdraw, Fund transfer, profile views. create, login and logout functionality. Add new functionality called Close Account. Once user clicks on the account apart form deposit and withdraw option it will show close account. Once close account is clicked it should do the proper validations. If money is there then show the popup and give an option to transfer the money to different account. once account is closed it should not have an option to do any transaction on it. like deposit, withdraw and re-open of the account."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Close Account with Zero Balance (Priority: P1)

A customer wants to close an active bank account that has no remaining balance. The customer navigates to the account details page, clicks the Close Account option, confirms the action, and the account is permanently marked as closed.

**Why this priority**: This is the simplest and most common closure path. It establishes the core account closure capability and validates the account status transition without involving funds transfer.

**Independent Test**: Can be fully tested by creating an account with a zero balance, clicking Close Account, confirming, and verifying that the account status changes to closed.

**Acceptance Scenarios**:

1. **Given** an authenticated customer viewing an active account with a zero balance, **When** the customer clicks Close Account and confirms the closure, **Then** the account is marked as closed and the customer is returned to the account list.
2. **Given** an authenticated customer viewing an active account with a zero balance, **When** the customer cancels the closure confirmation, **Then** the account remains active and no state change occurs.

---

### User Story 2 - Close Account with Positive Balance (Priority: P2)

A customer wants to close an active account that still has a positive balance. The customer chooses to transfer the remaining balance to another active account they own before confirming the closure.

**Why this priority**: Closing an account with a positive balance is a frequent real-world scenario. It depends on the existing transfer capability and ensures the customer does not lose access to their funds.

**Independent Test**: Can be fully tested by creating an account with a positive balance, clicking Close Account, selecting a destination account, transferring the balance, and verifying that the source account is closed and the destination account reflects the transferred amount.

**Acceptance Scenarios**:

1. **Given** an authenticated customer viewing an active account with a positive balance, **When** the customer clicks Close Account, **Then** a popup appears offering to transfer the balance to another active account owned by the customer.
2. **Given** the transfer popup is open, **When** the customer selects a valid destination account and confirms the transfer, **Then** the balance is transferred and the source account is marked as closed.
3. **Given** the transfer popup is open, **When** the customer cancels the transfer, **Then** the source account remains active and no balance is moved.

---

### User Story 3 - View Closed Account and Prevent Transactions (Priority: P3)

A customer wants to review a previously closed account. The account details page shows the closed status and hides all transaction actions such as deposit, withdraw, and close account. There is no option to reopen the account.

**Why this priority**: This story ensures that closed accounts are immutable and protects customers from accidental transactions on accounts that should no longer be active.

**Independent Test**: Can be fully tested by navigating to a closed account and verifying that the deposit, withdraw, and close account options are not displayed and that no reopen option exists.

**Acceptance Scenarios**:

1. **Given** an authenticated customer viewing a closed account, **When** the account details page loads, **Then** the closed status is visible and the deposit, withdraw, and close account options are hidden.
2. **Given** an authenticated customer viewing a closed account, **When** the customer attempts to access the deposit or withdraw flow via a direct link, **Then** the system blocks the action and shows an error message indicating the account is closed.

---

### Edge Cases

- **Account with negative balance**: The system MUST block closure and display an error instructing the customer to deposit sufficient funds through the existing deposit flow to bring the balance to zero or positive before attempting closure again.
- **Only account with positive balance**: The system MUST block closure and display a message directing the customer to open another account first so that the positive balance can be transferred during the closure flow.
- **Already closed account**: The system MUST reject any attempt to close an account that is already closed.
- **Account not owned by customer**: The system MUST reject any closure attempt by a customer who does not own the account.
- **Concurrent closure attempts**: If two closure requests for the same account arrive simultaneously, the system MUST process only one and reject the second with an appropriate error.
- **Closure cancellation**: If the customer closes the popup or cancels the confirmation, the account MUST remain active and no funds must be transferred.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a Close Account option on the account details page for active accounts.
- **FR-002**: The system MUST authenticate the customer before allowing account closure.
- **FR-003**: The system MUST validate that the account is active and belongs to the authenticated customer.
- **FR-004**: The system MUST allow closing an account with a zero balance without requiring a funds transfer.
- **FR-005**: If an account has a positive balance, the system MUST prompt the customer to transfer the full balance to another active account owned by the same customer.
- **FR-006**: The system MUST block account closure if the account has a negative balance and display an error message instructing the customer to deposit sufficient funds first.
- **FR-007**: The system MUST mark the account as closed after successful closure and record the closure timestamp.
- **FR-008**: The system MUST prevent deposits, withdrawals, and closure attempts on a closed account.
- **FR-009**: The system MUST NOT provide any option to reopen a closed account.
- **FR-010**: The system MUST retain the account's transaction history after closure.
- **FR-011**: The system MUST notify the customer of the successful closure and show the final account status.
- **FR-012**: The system MUST log the closure event for audit purposes, including the customer, account, timestamp, and final balance.
- **FR-013**: The system MUST block account closure if the customer has no other active account to receive a positive balance and display a message directing the customer to open another account first.

### Key Entities

- **Account**: Represents a customer bank account. Key attributes include account number, account type, balance, status (Active/Closed), owner, and opening date.
- **Customer**: Represents the authenticated user who owns the account. Key attributes include customer ID, full name, and username.
- **Transfer**: Represents the movement of funds from the account being closed to another account. Key attributes include source account, destination account, amount, timestamp, and status.
- **Transaction History**: The immutable record of all deposits, withdrawals, and transfers associated with the account. It MUST remain accessible after closure.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A customer can close an account with a zero balance in under 60 seconds from the account details page.
- **SC-002**: A customer can close an account with a positive balance by transferring funds in under 2 minutes.
- **SC-003**: 100% of closed accounts reject subsequent deposits, withdrawals, and closure attempts.
- **SC-004**: A customer can view a closed account's status and transaction history after closure.
- **SC-005**: 95% of customers successfully complete account closure on the first attempt without contacting support.

## Assumptions

- Account balances are non-negative in normal operation due to existing overdraft protection on withdrawals.
- Customers can only transfer funds to other active accounts that they own.
- The existing login and authentication flow is reused for this feature.
- The existing deposit, withdrawal, and fund transfer functionality remains unchanged for active accounts.
- Closed accounts retain their transaction history indefinitely for audit and customer reference.
- Only the account owner can initiate closure; admin or support-initiated closure is out of scope.
