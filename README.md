# 🔐 SecurePay – Secure International Payments Portal

A production-style, full-stack banking application with JWT authentication, role-based access control, and comprehensive security hardening.

---

## 📁 Project Structure

```
secure-payments-portal/
├── backend/                     # ASP.NET Core 8 Web API
│   ├── Controllers/
│   │   ├── AuthController.cs    # Register & Login endpoints
│   │   └── PaymentsController.cs# Payment CRUD endpoints
│   ├── Data/
│   │   └── ApplicationDbContext.cs
│   ├── Middleware/
│   │   └── SecurityHeadersMiddleware.cs
│   ├── Models/
│   │   ├── User.cs
│   │   ├── Payment.cs
│   │   └── Dtos.cs
│   ├── Services/
│   │   ├── InputValidationService.cs
│   │   └── JwtService.cs
│   ├── Program.cs
│   ├── appsettings.json
│   └── SecurePaymentsPortal.csproj
├── frontend/                    # React 18 + Bootstrap 5
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Navbar.js
│       │   └── ProtectedRoute.js
│       ├── pages/
│       │   ├── Home.js
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── PaymentPage.js
│       │   └── AdminPortal.js
│       ├── services/
│       │   ├── api.js           # Axios wrapper with JWT interceptors
│       │   └── AuthContext.js   # Global auth state
│       ├── App.js
│       ├── App.css
│       └── index.js
├── database.sql                 # MySQL schema + seed data
└── README.md
```

---

## 🛠️ Prerequisites

| Tool | Version |
|------|---------|
| .NET SDK | 8.0+ |
| Node.js | 18+ |
| npm | 9+ |
| MySQL Server | 8.0+ |

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register new customer |
| POST | `/api/auth/login` | None | Login, returns JWT |

### Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/pay` | Customer JWT | Create new payment |
| GET | `/api/payments/my` | Customer JWT | Get own payments |
| GET | `/api/payments/all` | Admin JWT | Get all payments |
| POST | `/api/payments/verify/{id}` | Admin JWT | Verify payment |

---

## 🔒 Security Features

### Authentication & Session
- **JWT tokens** (HMAC-SHA256 signed, 1-hour expiry)
- **BCrypt** password hashing (work factor 12)
- **Role claims** in JWT (`Customer` / `Admin`)
- Constant-time password comparison (prevents timing attacks)

### Input Validation (Whitelist Regex)
| Field | Pattern |
|-------|---------|
| Full Name | `^[A-Za-z\s]{2,100}$` |
| ID Number | `^\d{13}$` |
| Account Number | `^\d{8,12}$` |
| Amount | `^\d{1,15}(\.\d{1,2})?$` |
| SWIFT Code | `^[A-Z0-9]{8}([A-Z0-9]{3})?$` |
| Currency | `^[A-Z]{3,10}$` |
| Password | Min 8 chars, upper/lower/digit/special |

### Attack Mitigations

| Attack | Protection |
|--------|------------|
| SQL Injection | Entity Framework Core parameterized queries |
| XSS | `X-XSS-Protection`, `Content-Security-Policy`, input sanitisation |
| Clickjacking | `X-Frame-Options: DENY`, `frame-ancestors 'none'` |
| MITM | HTTPS enforced (`UseHttpsRedirection`), HSTS header |
| Session Hijacking | JWT with short expiry, no server-side session state |
| DDoS / Brute Force | `AspNetCoreRateLimit` (10 login attempts/min, 5 registers/min) |
| MIME Sniffing | `X-Content-Type-Options: nosniff` |
| Information Leakage | Generic error messages on auth failures |

---
