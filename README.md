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

## 🗄️ Database Setup

1. Open MySQL Workbench or the MySQL CLI.
2. Run the provided SQL script:

```bash
mysql -u root -p < database.sql
```

This will:
- Create the `payments_db` database
- Create `users` and `payments` tables with constraints
- Seed a pre-registered **Admin** account
- Seed a demo **Customer** account

---

## ⚙️ Backend Setup (ASP.NET Core)

### 1. Configure the connection string

Edit `backend/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=payments_db;User=root;Password=YOUR_PASSWORD;CharSet=utf8mb4;"
}
```

Replace `YOUR_PASSWORD` with your MySQL root password.

### 2. Restore NuGet packages

```bash
cd backend
dotnet restore
```

### 3. Run the API

```bash
dotnet run
```

The API will start on `http://localhost:5000` (HTTP) and `https://localhost:5001` (HTTPS).

> **Note:** If you have a `dotnet dev-certs` issue, run:
> ```bash
> dotnet dev-certs https --trust
> ```

---

## 🌐 Frontend Setup (React)

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure API URL (optional)

By default the React app proxies to `http://localhost:5000` (set in `package.json`).  
To override, create `frontend/.env`:

```
REACT_APP_API_URL=http://localhost:5000
```

### 3. Start the React app

```bash
npm start
```

The app will open at `http://localhost:3000`.

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

## 📝 Notes

- The admin account is pre-seeded via the SQL script. There is no registration UI for admin users by design.
- In production, set `RequireHttpsMetadata = true` in `Program.cs` and use a proper TLS certificate.
- Rotate the JWT secret key in `appsettings.json` before deploying.
- The BCrypt hashes in `database.sql` correspond to the password `Admin@1234`.
