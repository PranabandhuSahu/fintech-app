# NovaBank — Simple Fintech Application

A simple but production-style fintech application built with a **React** frontend and a **Spring Boot microservices** backend using an embedded **H2** database.

## Features

1. **User Registration** — create an account with full name, username, email and password.
2. **User Login** — JWT-based authentication.
3. **Account Opening** — open Savings / Checking / Current accounts with an initial deposit.
4. **Transaction History** — per-account ledger with deposits and withdrawals (and running balance).
5. **Log out** — clears the session.
6. **Account & Profile Details** — a dedicated page showing the signed-in user's profile (full name, username, email, customer ID, member-since) plus an account summary (total accounts, total balance, and a table of all accounts).

Extras: deposit & withdrawal with overdraft protection, client- and server-side validation, global error/alert handling (toast notifications), a Bank of America inspired red/navy theme with a custom bank logo, and a clean, responsive UI/UX.

## Architecture

```
                         ┌─────────────────────┐
   React (Vite) :5173 ──►│  API Gateway :8080   │  (Spring Cloud Gateway + CORS)
                         └──────────┬──────────┘
                                    │  routes via Eureka (lb://)
        ┌───────────────┬──────────┼─────────────────┐
        ▼               ▼          ▼                  ▼
 auth-service     account-service   transaction-service   discovery-server
   :8081             :8082               :8083              :8761 (Eureka)
   (H2 authdb)     (H2 accountdb)      (H2 transactiondb)
```

- **discovery-server** — Netflix Eureka service registry.
- **api-gateway** — single entry point; routes `/api/auth/**`, `/api/accounts/**`, `/api/transactions/**`; handles CORS.
- **auth-service** — registration, login, JWT issuance (BCrypt password hashing).
- **account-service** — account opening, balances, deposit/withdraw; records ledger entries in transaction-service (inter-service call forwarding the user's JWT).
- **transaction-service** — transaction ledger and history.

Each business service owns its **own H2 in-memory database** (database-per-service). All services validate the JWT issued by auth-service using a shared secret.

## Tech Stack

| Layer        | Technology |
|--------------|------------|
| Frontend     | React 18, React Router, Axios, Vite |
| Backend      | Spring Boot 3.2, Spring Cloud 2023.0 (Gateway + Eureka), Spring Security, Spring Data JPA |
| Auth         | JWT (jjwt), BCrypt |
| Database     | H2 (in-memory) |
| Build        | Maven (multi-module), npm |
| Java         | 17 |

## Prerequisites

- Java 17+
- Maven 3.6+
- Node.js 18+ and npm

## Running the application

### 1. Backend

Build all services:

```bash
cd backend
mvn -DskipTests clean package
```

Start them (each in its own terminal), **starting with the discovery server**:

```bash
java -jar discovery-server/target/discovery-server-1.0.0.jar
java -jar auth-service/target/auth-service-1.0.0.jar
java -jar account-service/target/account-service-1.0.0.jar
java -jar transaction-service/target/transaction-service-1.0.0.jar
java -jar api-gateway/target/api-gateway-1.0.0.jar
```

Or use the helper scripts from the project root:

```bash
./run-all.sh     # starts all 5 services in the background (logs in ./logs)
./stop-all.sh    # stops them
```

Give the services ~20s to register with Eureka. You can view the registry at http://localhost:8761.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

> The frontend talks to the gateway at `http://localhost:8080` by default. Override with `VITE_API_BASE_URL` if needed.

## API Overview (via gateway :8080)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | – | Register a new user |
| POST | `/api/auth/login` | – | Log in, returns JWT |
| GET  | `/api/auth/me` | ✓ | Get the signed-in user's profile |
| GET  | `/api/accounts` | ✓ | List the user's accounts |
| POST | `/api/accounts` | ✓ | Open a new account |
| GET  | `/api/accounts/{id}` | ✓ | Get a single account |
| POST | `/api/accounts/{id}/deposit` | ✓ | Deposit funds |
| POST | `/api/accounts/{id}/withdraw` | ✓ | Withdraw funds (overdraft protected) |
| GET  | `/api/transactions?accountId={id}` | ✓ | Transaction history |

Authenticated requests must send `Authorization: Bearer <token>`.

## Error & Exception Handling

- **Backend**: each service has a `@RestControllerAdvice` `GlobalExceptionHandler` returning a consistent JSON error shape (`{timestamp, status, error, message, fieldErrors}`). Bean Validation errors return field-level messages; business rule violations (e.g. duplicate username, insufficient funds) return appropriate HTTP status codes.
- **Frontend**: a central Axios interceptor normalizes errors into readable messages, auto-logs-out on `401`, and surfaces everything via toast notifications. Forms also perform inline client-side validation.

## H2 Consoles (for inspection)

Each service exposes an H2 console (the service must be reached directly, not via the gateway):

- auth-service: http://localhost:8081/h2-console (JDBC URL `jdbc:h2:mem:authdb`)
- account-service: http://localhost:8082/h2-console (JDBC URL `jdbc:h2:mem:accountdb`)
- transaction-service: http://localhost:8083/h2-console (JDBC URL `jdbc:h2:mem:transactiondb`)

User: `sa`, empty password.

## Project Structure

```
fintech-app/
├── backend/
│   ├── pom.xml                 # parent (multi-module)
│   ├── discovery-server/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── account-service/
│   └── transaction-service/
├── frontend/
│   ├── src/
│   │   ├── api/                # axios client + interceptors
│   │   ├── context/            # Auth + Toast providers
│   │   ├── components/         # Navbar, ProtectedRoute
│   │   ├── pages/              # Login, Register, Dashboard, AccountDetail
│   │   └── utils/
│   └── package.json
├── run-all.sh
└── stop-all.sh
```
