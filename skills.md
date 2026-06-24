# NovaBank Fintech App - Skills & Development Guide

This document outlines the available skills, development workflows, and architectural patterns for the NovaBank fintech application.

## Project Overview

NovaBank is a full-stack fintech application with:
- **Frontend**: React 18 + Vite + React Router
- **Backend**: Spring Boot microservices architecture
- **Database**: H2 in-memory databases (one per service)
- **Architecture**: Microservices with API Gateway + Service Discovery (Eureka)

## Architecture Summary

```
React Frontend :5173 ──► API Gateway :8080 ──► Microservices
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            auth-service    account-service  transaction-service
              :8081           :8082            :8083
                                   ▼
                        discovery-server :8761
```

## Available Development Skills

### 1. Backend Development Skills

#### Microservice Development
- **Skill**: Create new Spring Boot microservices
- **Prerequisites**: Java 17+, Maven 3.6+
- **Pattern**: Follow existing service structure (controller, service, repository, model, dto)
- **Location**: `backend/{service-name}/`

#### Database Operations
- **Skill**: H2 database management and queries
- **Access**: Each service has its own H2 console
- **URLs**:
  - auth-service: http://localhost:8081/h2-console
  - account-service: http://localhost:8082/h2-console
  - transaction-service: http://localhost:8083/h2-console
- **JDBC URLs**: `jdbc:h2:mem:{servicedb}`

#### API Development
- **Skill**: RESTful API development with Spring Boot
- **Security**: JWT-based authentication using shared secret
- **Validation**: Bean Validation + custom business logic
- **Error Handling**: GlobalExceptionHandler pattern

#### Inter-Service Communication
- **Skill**: Service-to-service calls with JWT forwarding
- **Example**: account-service → transaction-service
- **Technology**: RestTemplate/Feign clients

### 2. Frontend Development Skills

#### React Component Development
- **Skill**: Modern React 18 with functional components and hooks
- **Location**: `frontend/src/components/`
- **Patterns**: Context API for state management, custom hooks

#### State Management
- **Skill**: React Context for global state
- **Contexts**:
  - `AuthContext`: Authentication state and user data
  - `ToastContext`: Global notification system

#### API Integration
- **Skill**: Axios client with interceptors
- **Location**: `frontend/src/api/client.js`
- **Features**: Automatic JWT handling, error normalization, 401 auto-logout

#### Routing & Navigation
- **Skill**: React Router v6 for SPA navigation
- **Protected Routes**: `ProtectedRoute` component
- **Pages**: Login, Register, Dashboard, AccountDetail, Profile, Transfer

#### UI/UX Development
- **Skill**: Responsive design with CSS Grid/Flexbox
- **Theme**: Bank of America inspired (red/navy)
- **Validation**: Client-side form validation with error states

### 3. Full-Stack Integration Skills

#### Authentication Flow
- **Skill**: JWT-based authentication system
- **Flow**: Login → JWT → Protected API calls → Auto-refresh
- **Security**: BCrypt password hashing, JWT validation

#### Transaction Processing
- **Skill**: Financial transaction handling
- **Features**: Deposits, withdrawals, overdraft protection
- **Audit**: Complete transaction history with running balances

#### Error Handling
- **Skill**: End-to-end error handling
- **Backend**: GlobalExceptionHandler with consistent error format
- **Frontend**: Axios interceptors + toast notifications

## Development Workflows

### 1. Starting the Application

#### Backend Services (order matters):
```bash
cd backend
mvn -DskipTests clean package

# Start services in order (each in separate terminal):
java -jar discovery-server/target/discovery-server-1.0.0.jar
java -jar auth-service/target/auth-service-1.0.0.jar
java -jar account-service/target/account-service-1.0.0.jar
java -jar transaction-service/target/transaction-service-1.0.0.jar
java -jar api-gateway/target/api-gateway-1.0.0.jar
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

#### Quick Start Scripts:
```bash
./run-all.sh    # Start all backend services
./stop-all.sh   # Stop all services
```

### 2. Adding New Features

#### Backend Feature Addition:
1. Create DTOs for request/response
2. Add model entities if needed
3. Implement repository layer
4. Create service layer with business logic
5. Add controller with REST endpoints
6. Update security configuration if needed
7. Add validation and error handling

#### Frontend Feature Addition:
1. Create new component/page in `src/pages/` or `src/components/`
2. Add API client methods in `src/api/`
3. Update routing in `App.jsx`
4. Add navigation if needed
5. Implement form validation
6. Add loading/error states

### 3. Testing & Debugging

#### Backend Testing:
- **Unit Tests**: JUnit 5 + Mockito
- **Integration Tests**: @SpringBootTest
- **Database Inspection**: H2 consoles
- **Service Registry**: http://localhost:8761

#### Frontend Testing:
- **Manual Testing**: Browser dev tools
- **Network Tab**: Monitor API calls
- **Console**: Check for React errors
- **React DevTools**: Component state inspection

## Common Development Tasks

### 1. Adding a New Microservice
```bash
# Create new module in backend/pom.xml
# Follow existing service structure:
backend/
└── new-service/
    ├── pom.xml
    └── src/main/java/com/fintech/newservice/
        ├── NewServiceApplication.java
        ├── controller/
        ├── service/
        ├── repository/
        ├── model/
        ├── dto/
        └── security/
```

### 2. Adding New API Endpoints
```java
@RestController
@RequestMapping("/api/new-resource")
public class NewController {
    
    @GetMapping
    public ResponseEntity<List<NewResponse>> getAll() {
        // Implementation
    }
    
    @PostMapping
    public ResponseEntity<NewResponse> create(@Valid @RequestBody NewRequest request) {
        // Implementation
    }
}
```

### 3. Adding New Frontend Pages
```jsx
// src/pages/NewPage.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function NewPage() {
    const { user } = useContext(AuthContext);
    
    return (
        <div className="page">
            {/* Component content */}
        </div>
    );
}
```

## API Reference

### Authentication Endpoints (via Gateway :8080)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT)
- `GET /api/auth/me` - Get current user profile

### Account Endpoints
- `GET /api/accounts` - List user accounts
- `POST /api/accounts` - Open new account
- `GET /api/accounts/{id}` - Get account details
- `POST /api/accounts/{id}/deposit` - Deposit funds
- `POST /api/accounts/{id}/withdraw` - Withdraw funds

### Transaction Endpoints
- `GET /api/transactions?accountId={id}` - Get transaction history

## Configuration & Environment

### Environment Variables
- `VITE_API_BASE_URL` - Frontend API base URL (default: http://localhost:8080)
- JWT secret is shared across all microservices

### Database Configuration
- Each service uses H2 in-memory database
- Database names: `authdb`, `accountdb`, `transactiondb`
- Auto-initialized on service startup

### Security Configuration
- JWT expiration: 24 hours
- Password hashing: BCrypt
- CORS: Configured in API Gateway for frontend origin

## Best Practices

### Backend
- Use DTOs for all API inputs/outputs
- Implement proper validation using Bean Validation
- Follow repository pattern for data access
- Use @Transactional for database operations
- Handle exceptions consistently with GlobalExceptionHandler

### Frontend
- Use functional components with hooks
- Implement proper loading states
- Handle API errors gracefully
- Use Context API for global state
- Follow responsive design principles

### General
- Keep services loosely coupled
- Use proper logging for debugging
- Follow existing naming conventions
- Write meaningful commit messages
- Test thoroughly before deployment

## Troubleshooting

### Common Issues
1. **Services not registering**: Check Eureka at http://localhost:8761
2. **CORS errors**: Verify API Gateway configuration
3. **JWT validation failures**: Check shared secret consistency
4. **Database connection issues**: Verify H2 console access
5. **Frontend build errors**: Check npm dependencies and Vite config

### Debugging Tips
- Check service logs for errors
- Use browser dev tools for frontend debugging
- Verify API calls in Network tab
- Check Eureka service registry
- Use H2 consoles for database inspection