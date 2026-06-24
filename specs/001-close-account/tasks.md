# Tasks: Close Account

**Input**: Design documents from `/specs/001-close-account/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/close-account-service/src/main/java/com/fintech/closeaccount/...` and `backend/account-service/src/main/java/com/fintech/account/...`
- **Frontend**: `frontend/src/...`
- **Config**: `backend/pom.xml`, `backend/api-gateway/src/main/resources/application.yml`, `run-all.sh`, `stop-all.sh`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the new backend microservice and register it in the project infrastructure.

- [x] T001 Add `close-account-service` module to `backend/pom.xml`
- [x] T002 [P] Create `backend/close-account-service/pom.xml` with Spring Boot, Spring Cloud, JPA, Security, Validation, H2, and jjwt dependencies matching parent versions
- [x] T003 [P] Create `backend/close-account-service/src/main/java/com/fintech/closeaccount/CloseAccountApplication.java`
- [x] T004 [P] Create package structure for `client`, `config`, `controller`, `dto`, `exception`, `model`, `repository`, `security`, `service`
- [x] T005 [P] Add `close-account-service` startup and shutdown to `run-all.sh` and `stop-all.sh`
- [x] T006 Add `/api/close-account/**` route to `backend/api-gateway/src/main/resources/application.yml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 [P] Add `CLOSED` status value to `backend/account-service/src/main/java/com/fintech/account/model/Account.java`
- [x] T008 [P] Add `AccountStatusUpdateRequest` DTO in `backend/account-service/src/main/java/com/fintech/account/dto/`
- [x] T009 [P] Add status update endpoint to `backend/account-service/src/main/java/com/fintech/account/controller/AccountController.java`
- [x] T010 [P] Implement status update logic in `backend/account-service/src/main/java/com/fintech/account/service/AccountService.java`
- [x] T011 [P] Create `AccountClosure` entity in `backend/close-account-service/src/main/java/com/fintech/closeaccount/model/AccountClosure.java`
- [x] T012 [P] Create `AccountClosureRepository` in `backend/close-account-service/src/main/java/com/fintech/closeaccount/repository/AccountClosureRepository.java`
- [x] T013 [P] Create exception classes (`ApiException`, `ErrorResponse`, `GlobalExceptionHandler`) in `backend/close-account-service/src/main/java/com/fintech/closeaccount/exception/`
- [x] T014 [P] Create security config and JWT filter (`SecurityConfig`, `JwtAuthFilter`, `UserPrincipal`) in `backend/close-account-service/src/main/java/com/fintech/closeaccount/security/`
- [x] T015 [P] Create `AccountClient` to call `account-service` endpoints in `backend/close-account-service/src/main/java/com/fintech/closeaccount/client/AccountClient.java`
- [x] T016 [P] Add `application.yml` to `backend/close-account-service/src/main/resources/` with H2, Eureka, and server port configuration
- [x] T017 Add close-account API methods to `frontend/src/api/client.js`

**Checkpoint**: Foundation ready — new service is bootable, gateway routes requests, account status supports CLOSED, and frontend can reach the new endpoint.

---

## Phase 3: User Story 1 - Close Account with Zero Balance (Priority: P1) 🎯 MVP

**Goal**: Allow customers to close an active account with a zero balance directly from the account details page.

**Independent Test**: Create an account with zero balance, click Close Account, confirm, and verify the account status becomes `CLOSED` and the UI returns to the dashboard.

### Implementation for User Story 1

- [x] T018 [P] [US1] Create `CloseAccountRequest` and `CloseAccountResponse` DTOs in `backend/close-account-service/src/main/java/com/fintech/closeaccount/dto/`
- [x] T019 [US1] Implement `CloseAccountService.closeAccount` validation and closure logic in `backend/close-account-service/src/main/java/com/fintech/closeaccount/service/CloseAccountService.java`
- [x] T020 [US1] Implement `CloseAccountController` POST `/api/close-account` in `backend/close-account-service/src/main/java/com/fintech/closeaccount/controller/CloseAccountController.java`
- [x] T021 [US1] Add **Close Account** button to `frontend/src/pages/AccountDetail.jsx`
- [x] T022 [US1] Add confirmation dialog for zero-balance closure in `frontend/src/pages/AccountDetail.jsx`
- [x] T023 [US1] Handle closure success and error messages with toast notifications in `frontend/src/pages/AccountDetail.jsx`

**Checkpoint**: User Story 1 is fully functional and testable independently. Customers can close zero-balance accounts.

---

## Phase 4: User Story 2 - Close Account with Positive Balance (Priority: P2)

**Goal**: When closing an account with a positive balance, prompt the customer to transfer the balance to another active account before closing.

**Independent Test**: Create an account with a positive balance, click Close Account, select a destination account in the popup, confirm, and verify the balance is transferred and the source account is closed.

### Implementation for User Story 2

- [x] T024 [P] [US2] Extend `CloseAccountService` to transfer positive balance via `account-service` before closure in `backend/close-account-service/src/main/java/com/fintech/closeaccount/service/CloseAccountService.java`
- [x] T025 [US2] Update `CloseAccountController` to accept `destinationAccountId` in `backend/close-account-service/src/main/java/com/fintech/closeaccount/controller/CloseAccountController.java`
- [x] T026 [US2] Add positive-balance transfer popup to `frontend/src/pages/AccountDetail.jsx`
- [x] T027 [US2] Populate destination account dropdown and validate selection in `frontend/src/pages/AccountDetail.jsx`
- [x] T028 [US2] Wire transfer-and-close flow to `POST /api/close-account` in `frontend/src/pages/AccountDetail.jsx`

**Checkpoint**: User Story 2 is fully functional. Customers can close accounts with positive balances by transferring funds.

---

## Phase 5: User Story 3 - View Closed Account and Prevent Transactions (Priority: P3)

**Goal**: Ensure closed accounts are visible but immutable — no deposits, withdrawals, or reopening.

**Independent Test**: Open a closed account and verify that the Deposit, Withdraw, and Close Account buttons are hidden, and direct backend calls for deposit/withdraw are rejected.

### Implementation for User Story 3

- [x] T029 [P] [US3] Add `CLOSED` status rendering in `frontend/src/pages/AccountDetail.jsx`
- [x] T030 [US3] Hide Deposit, Withdraw, and Close Account buttons when account status is `CLOSED` in `frontend/src/pages/AccountDetail.jsx`
- [x] T031 [US3] Block deposits and withdrawals on `CLOSED` accounts in `backend/account-service/src/main/java/com/fintech/account/service/AccountService.java`
- [x] T032 [US3] Block closure attempts on already-closed accounts in `backend/close-account-service/src/main/java/com/fintech/closeaccount/service/CloseAccountService.java`
- [x] T033 [US3] Add audit logging for closure events in `backend/close-account-service/src/main/java/com/fintech/closeaccount/service/CloseAccountService.java`

**Checkpoint**: User Story 3 is fully functional. Closed accounts are read-only and cannot be reopened.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [x] T034 [P] Update `README.md` with `close-account-service` startup instructions and port information
- [x] T035 [P] Run quickstart validation scenarios documented in `specs/001-close-account/quickstart.md`
- [x] T036 [P] Review code for SOLID compliance, consistent exception handling, and WCAG accessibility in changed frontend components
- [x] T037 [P] Add `close-account-service` H2 console URL to `README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Stories (Phase 3–5)**: All depend on Foundational phase completion.
  - User stories can proceed in parallel (if staffed).
  - Or sequentially in priority order (P1 → P2 → P3).
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational phase. No dependencies on other stories.
- **User Story 2 (P2)**: Can start after Foundational phase. Reuses the close-account endpoint from US1 and adds the transfer flow.
- **User Story 3 (P3)**: Can start after Foundational phase. Depends on the existence of closed accounts (from US1 or test data) but can be verified independently.

### Within Each User Story

- Models before services.
- Services before controllers.
- Backend endpoints before frontend integration.
- Story complete before moving to next priority.

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel.
- All Foundational tasks marked [P] can run in parallel.
- Within each user story, DTOs and UI markup tasks marked [P] can run in parallel.
- Backend service logic and frontend popup work can be developed in parallel once contracts are defined.

---

## Parallel Example: User Story 1

```bash
# Launch backend DTO and frontend button work in parallel:
Task: "Create CloseAccountRequest and CloseAccountResponse DTOs in backend/close-account-service/src/main/java/com/fintech/closeaccount/dto/"
Task: "Add Close Account button to frontend/src/pages/AccountDetail.jsx"

# Launch service and controller in sequence after DTOs:
Task: "Implement CloseAccountService.closeAccount in backend/close-account-service/src/main/java/com/fintech/closeaccount/service/CloseAccountService.java"
Task: "Implement CloseAccountController POST /api/close-account in backend/close-account-service/src/main/java/com/fintech/closeaccount/controller/CloseAccountController.java"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories).
3. Complete Phase 3: User Story 1 (close account with zero balance).
4. **STOP and VALIDATE**: Test closing a zero-balance account end-to-end.
5. Deploy/demo if ready.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready.
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!).
3. Add User Story 2 → Test positive-balance transfer flow independently.
4. Add User Story 3 → Test closed-account immutability.
5. Complete Phase 6: Polish → Final review and documentation.
