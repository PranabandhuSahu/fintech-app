# Implementation Plan: Close Account

**Branch**: `[main]` | **Date**: 2026-06-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-close-account/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a **Close Account** capability to NovaBank. Customers can close an active account from the account details page. If the account has a positive balance, the customer must transfer the remaining balance to another active account they own before closure. Once closed, the account must reject deposits, withdrawals, and reopen attempts, while remaining viewable with its transaction history.

The backend introduces a new microservice, `close-account-service`, responsible for orchestrating validation, transfer, and closure state. The frontend adds the close-account action to the account details page, a transfer popup, and closed-account visibility rules.

## Technical Context

**Language/Version**: Java 17 (matches existing backend services)

**Primary Dependencies**: Spring Boot 3.2.5, Spring Cloud 2023.0.1, Spring Data JPA, Spring Security, Spring Validation, H2, jjwt 0.11.5, Netflix Eureka Client, React 18, React Router 6, Axios 1.7.2, Vite 5

**Storage**: H2 in-memory database per service (consistent with existing database-per-service pattern). `close-account-service` stores closure events/audit records.

**Testing**: JUnit 5 + Spring Boot Test for backend; manual accessibility and UX validation for frontend.

**Target Platform**: Web browser (React frontend) and JVM microservices (backend).

**Project Type**: Web application with Spring Boot microservices backend.

**Performance Goals**: Account closure request completes end-to-end in under 1 second under normal load; UI remains responsive within 500ms of user action.

**Constraints**: 
- Must reuse existing Java, Spring Boot, and frontend versions and open-source libraries.
- Must follow existing backend package structure (controller, service, repository, model, dto, exception, security).
- Must add `close-account-service` as a new Maven module and register it in the parent `pom.xml`.
- Must add gateway route for `/api/close-account/**`.
- Must not expose internal service ports.

**Scale/Scope**: Single-user banking demo with in-memory H2 databases. Closure volume is expected to match the low-traffic demo usage of the existing application.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Evaluation | Status |
|-----------|------------|--------|
| I. Backend SOLID Architecture | `close-account-service` isolates the account closure responsibility. It delegates account data access and transfer logic to `account-service` via interfaces rather than duplicating business rules. This aligns with Single Responsibility and Dependency Inversion. | ✅ Pass |
| II. Backend Exception Handling & Reliability | The new service must expose a `@RestControllerAdvice` global handler with the same `{timestamp, status, error, message, fieldErrors}` shape. Inter-service calls must forward the JWT and handle failures. | ✅ Pass (requires implementation) |
| III. Frontend Accessibility (WCAG) | New Close Account button, popup, and status indicators must be keyboard reachable, have labels, and not rely on color alone. | ✅ Pass (requires implementation) |
| IV. Frontend NOVA Bank UX Design | The close action must follow the red/navy theme, toast feedback, and responsive layout. Closed-account view must hide disallowed actions. | ✅ Pass (requires implementation) |
| V. Security & Financial Data Protection | Closure endpoints must validate the JWT, enforce ownership, log closure events, and transmit data via HTTPS. | ✅ Pass (requires implementation) |

## Project Structure

### Documentation (this feature)

```text
specs/001-close-account/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── pom.xml                 # parent module list updated
├── close-account-service/  # new Spring Boot microservice
│   ├── pom.xml
│   └── src/main/java/com/fintech/closeaccount/
│       ├── CloseAccountApplication.java
│       ├── client/
│       │   └── AccountClient.java
│       ├── config/
│       │   └── SecurityConfig.java
│       ├── controller/
│       │   └── CloseAccountController.java
│       ├── dto/
│       │   ├── CloseAccountRequest.java
│       │   ├── CloseAccountResponse.java
│       │   └── TransferFundsRequest.java
│       ├── exception/
│       │   ├── ApiException.java
│       │   ├── ErrorResponse.java
│       │   └── GlobalExceptionHandler.java
│       ├── model/
│       │   └── AccountClosure.java
│       ├── repository/
│       │   └── AccountClosureRepository.java
│       ├── security/
│       │   ├── JwtAuthFilter.java
│       │   └── UserPrincipal.java
│       └── service/
│           └── CloseAccountService.java
├── api-gateway/
│   └── src/main/resources/application.yml  # route /api/close-account/**
└── account-service/
    ├── src/main/java/com/fintech/account/
    │   ├── controller/AccountController.java    # add status update endpoint
    │   ├── dto/AccountStatusUpdateRequest.java
    │   └── service/AccountService.java          # add close-status logic
    └── src/main/java/com/fintech/account/model/Account.java  # add status CLOSED

frontend/
├── src/
│   ├── api/client.js
│   ├── pages/
│   │   └── AccountDetail.jsx    # add Close Account action + popup
│   └── utils/format.js
```

**Structure Decision**: The project follows the existing NovaBank microservice layout. A new `close-account-service` is added to isolate the closure orchestration responsibility. The frontend change is localized to the account details page. The `account-service` remains the source of truth for account data and balance transfers.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New microservice (`close-account-service`) instead of adding the feature to `account-service` | The feature request explicitly requires a dedicated closure service. A separate service isolates the closure lifecycle, audit log, and orchestration from account balance management. | Adding the logic directly to `account-service` would be simpler but violates the explicit requirement and mixes closure orchestration with ongoing account operations. |
