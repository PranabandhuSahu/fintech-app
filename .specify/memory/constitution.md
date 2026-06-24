<!--
SYNC IMPACT REPORT
Version change: none → 1.0.0 (initial ratification)
Modified principles: N/A (new document)
Added sections:
  - Core Principles (I–V)
  - Technology & Constraints
  - Development Workflow & Quality Gates
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ reviewed (Constitution Check gate is generic)
  - .specify/templates/spec-template.md ✅ reviewed (no outdated references)
  - .specify/templates/tasks-template.md ✅ reviewed (no outdated references)
  - .specify/templates/checklist-template.md ✅ reviewed (no outdated references)
  - .specify/extensions/agent-context/commands/speckit.agent-context.update.md ✅ reviewed
Follow-up TODOs: none
-->

# NovaBank Constitution

## Core Principles

### I. Backend SOLID Architecture

Every backend service MUST follow the SOLID principles and domain-driven packaging.

- **Single Responsibility**: Each class and service has one reason to change; controllers delegate to services, services delegate to repositories.
- **Open/Closed**: Modules are open for extension (e.g., new account types) and closed for modification of existing, tested code.
- **Liskov Substitution**: Subtypes (e.g., `SavingsAccount`, `CheckingAccount`) MUST be substitutable for their base types without altering correctness.
- **Interface Segregation**: Client-specific interfaces (e.g., `AccountOperations`, `TransactionOperations`) MUST be used; fat general-purpose contracts are forbidden.
- **Dependency Inversion**: High-level modules MUST depend on abstractions; concrete implementations MUST be injected via Spring DI and MUST NOT be constructed directly.

Rationale: SOLID design keeps the microservice codebase testable, evolvable, and aligned with the Spring Boot ecosystem. It prevents the tight coupling that makes financial calculations brittle.

### II. Backend Exception Handling & Reliability

All backend services MUST handle failures consistently and never leak internal state to clients.

- Each service MUST expose a `@RestControllerAdvice` global exception handler that returns a unified JSON error shape:
  `timestamp`, `status`, `error`, `message`, and `fieldErrors`.
- Bean Validation errors MUST produce field-level error messages.
- Business rule violations (e.g., duplicate username, insufficient funds) MUST return semantically correct HTTP status codes.
- All unexpected exceptions MUST be logged with correlation identifiers before a generic error response is returned.
- Inter-service calls (e.g., account-service → transaction-service) MUST forward the authenticated user's JWT and handle timeouts and circuit failures by returning a structured error response and logging the incident without cascading the failure.

Rationale: A fintech application cannot afford silent failures or confusing error responses. Consistent exception handling supports debugging, regulatory audit, and customer trust.

### III. Frontend Accessibility (WCAG)

The React frontend MUST conform to WCAG 2.1 Level AA as the minimum accessibility standard.

- All interactive elements MUST be reachable and operable via keyboard.
- Form inputs MUST have associated `<label>` elements and clear error text exposed to assistive technology.
- Color MUST NOT be the only means of conveying information (e.g., success/error states also use text and icons).
- Focus indicators MUST be visible and follow a logical tab order.
- Images and icons MUST have meaningful alt text or be marked as decorative.
- Accessibility checks MUST be performed with automated tools (e.g., axe-core) during development and before release.

Rationale: Banking services must be usable by all customers, including those relying on screen readers or keyboard navigation. WCAG compliance is also a legal and reputational requirement for financial products.

### IV. Frontend NOVA Bank UX Design

The user interface MUST follow the NOVA Bank design language and deliver a trustworthy, consistent banking experience.

- The visual identity (red/navy color scheme, custom bank logo, typography, and spacing) MUST be applied consistently across all pages.
- Core journeys (register, login, open account, deposit, withdraw, transaction history, profile) MUST be reachable within three clicks from the dashboard.
- Feedback for actions (loading, success, error) MUST be immediate and explicit, using toast notifications and inline validation.
- The UI MUST be responsive from 320px to 1920px and remain usable on tablets and mobile devices.
- All amounts MUST be formatted as currency, dates localized, and sensitive numbers (e.g., account numbers) MUST be masked to reveal only the last four digits.

Rationale: A coherent NOVA Bank UX reduces cognitive load, builds customer confidence, and ensures that customers can complete financial tasks without friction.

### V. Security & Financial Data Protection

NovaBank MUST treat security and data protection as non-negotiable engineering requirements.

- Passwords MUST be hashed with BCrypt before storage; plain text or weak hashes are forbidden.
- All authenticated endpoints MUST validate the JWT issued by auth-service using the shared secret.
- Gateway routes MUST enforce CORS, reject unauthorized requests, and never expose internal service ports.
- Sensitive data (customer IDs, account numbers, balances) MUST be transmitted over HTTPS and logged only when required.
- Changes to financial state (deposits, withdrawals, account opening) MUST be auditable: who, when, and what changed.

Rationale: Financial applications are high-value targets. Defense in depth across authentication, transport, and audit protects both customers and the institution.

## Technology & Constraints

- **Backend**: Spring Boot 3.2, Spring Cloud Gateway + Eureka, Spring Security, Spring Data JPA, Java 17, Maven multi-module build.
- **Frontend**: React 18, React Router, Axios, Vite, npm.
- **Databases**: H2 in-memory per service (database-per-service pattern).
- **Authentication**: JWT (jjwt) with BCrypt password hashing.
- **Build**: Maven for backend; npm for frontend.
- **Runtime**: Services start in order: discovery-server → auth-service, account-service, transaction-service → api-gateway.

## Development Workflow & Quality Gates

- All features MUST be defined in a specification, planned in an implementation plan, and tracked through tasks before coding begins.
- Backend code MUST compile with no warnings treated as errors and pass unit and integration tests before merge.
- Frontend code MUST pass linting, type checking, and accessibility scans before merge.
- Pull requests MUST be reviewed for compliance with this constitution; violations MUST be justified in the Complexity Tracking section.
- The `main` branch MUST remain deployable at all times; breaking changes require a migration plan and a MAJOR version bump.

## Governance

This constitution is the single source of truth for NovaBank engineering standards and supersedes any conflicting practice.

- Amendments MUST be documented in a new version of this file, reviewed, and approved by the project lead.
- Versioning follows semantic versioning: MAJOR for incompatible governance or principle redefinition, MINOR for new principles or materially expanded guidance, PATCH for clarifications, wording, or typo fixes.
- Compliance with this constitution MUST be verified during code review and release planning.
- Any intentional deferral of a constitutional requirement MUST be recorded as a TODO in this file and in the Sync Impact Report.
- The development team MUST review this constitution at least once per quarter and update it to reflect evolving product, regulatory, or accessibility requirements.

**Version**: 1.0.0 | **Ratified**: 2026-06-24 | **Last Amended**: 2026-06-24
