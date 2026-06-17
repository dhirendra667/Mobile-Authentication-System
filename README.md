# Mobile Authentication Backend

REST API for mobile authentication — OTP-based Signup/Signin, JWT, Biometric login, PostgreSQL, rate limiting.

---

## Tech Stack

- Node.js + Express
- PostgreSQL + Sequelize ORM
- JWT (jsonwebtoken)
- bcryptjs (OTP hashing)
- Twilio / MSG91 (SMS)
- express-rate-limit (OTP rate limiting)
- Swagger UI (API docs)

---

## Project Structure

```
src/
├── config/           # DB, server, Swagger config
├── models/           # Sequelize models (User, OtpVerification)
├── repositories/     # DB layer (UserRepository, OtpRepository)
├── services/         # Business logic (AuthService, OtpService, UserService)
├── controllers/      # Request handlers (auth_controller, user_controller)
├── routes/v1/        # Express routers (auth_router, user_router)
├── middlewares/      # JWT auth, rate limiting
├── validators/       # Request body validation
├── errors/           # Custom error classes
└── utils/            # JWT helpers, OTP utils, SMS sender
migrations/           # Sequelize CLI migrations
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in DB credentials, JWT secret, and SMS provider details
```

### 3. Create database
```sql
CREATE DATABASE mobile_auth_db;
```

### 4. Run migrations
```bash
npm run db:migrate
```

### 5. Start the server
```bash
npm run dev       # development (nodemon)
npm start         # production
```

### 6. Open API docs
```
http://localhost:5000/api-docs
```

---

## API Endpoints

### Signup Flow
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup/send-otp` | Step 1 — Send OTP to mobile |
| POST | `/api/v1/auth/signup/verify-otp` | Step 2 — Verify OTP, get signup_token |
| POST | `/api/v1/auth/signup/complete` | Step 3 — Submit profile, create account |

### Signin Flow
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signin/send-otp` | Step 1 — Send OTP to mobile |
| POST | `/api/v1/auth/signin/verify-otp` | Step 2 — Verify OTP, get JWT |

### Biometric Login
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/biometric-login` | Login after on-device biometric passes |

### User Profile (Protected — Bearer JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get profile |
| PUT | `/api/v1/users/me` | Update profile |
| PUT | `/api/v1/users/me/biometric` | Enable/disable biometrics |
| DELETE | `/api/v1/users/me` | Delete account |

---

## OTP Rate Limiting

Two layers of protection:

**Layer 1 — HTTP middleware** (`express-rate-limit`):
- Keyed by mobile number from request body
- Max 5 OTP send requests per 15-minute window
- Returns HTTP 429 with JSON error

**Layer 2 — DB check** (inside `OtpService`):
- Counts recent OTP records in `OtpVerifications` table
- Catches requests that bypass the HTTP layer
- Same limits as Layer 1

Additionally, each OTP is locked after **3 wrong verify attempts** to prevent brute force.

---

## Security Notes

- OTPs are hashed with bcrypt before storage — never stored in plain text
- OTPs expire after 10 minutes (configurable via `OTP_EXPIRY_MINUTES`)
- Biometric images are **never stored** — only `biometric_enabled` (boolean) and `biometric_type` (enum) are stored. Actual biometric data stays in Android Keystore / Apple Secure Enclave
- Signup uses a short-lived `signup_token` (5 min) between OTP verify and account creation to ensure account creation is only possible after OTP verification
- All protected routes require a Bearer JWT

---

## SMS Providers

Set `SMS_PROVIDER` in `.env` to `twilio` or `msg91`.

In **development** mode (`NODE_ENV=development`), no SMS is sent — the OTP is printed to the console instead.

---

## Database Tables

### Users
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| name | STRING | Required |
| age | INTEGER | Required |
| gender | ENUM | male / female / other |
| date_of_birth | DATEONLY | Required |
| mobile | STRING UNIQUE | E.164 format |
| biometric_enabled | BOOLEAN | Default false |
| biometric_type | ENUM | fingerprint / face_id / none |

### OtpVerifications
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| mobile | STRING | E.164 format |
| otp_hash | STRING | bcrypt hash of OTP |
| purpose | ENUM | signup / signin |
| expires_at | DATE | OTP expiry timestamp |
| is_verified | BOOLEAN | Prevents OTP reuse |
| attempts | INTEGER | Wrong guess counter |

---

## SMS Providers Comparison

| Provider | Cost | Works for | Signup |
|----------|------|-----------|--------|
| **Fast2SMS** ⭐ | Free tier | Indian numbers | [fast2sms.com](https://www.fast2sms.com) → Dev API |
| **console** | Free | Local dev/testing — prints OTP to terminal | No signup needed |
| **MSG91** | Free tier | Indian numbers | [msg91.com](https://msg91.com) |
| **Twilio** | Free trial (~$15) | Global | [twilio.com](https://www.twilio.com) |

Set `SMS_PROVIDER` in `.env`. In `NODE_ENV=development` the OTP is **always** printed to the console regardless of the provider setting.

## Seeders

| Command | Effect |
|---------|--------|
| `npm run db:seed` | Creates demo user + 2 usable OTPs (valid 30 min) |
| `npm run db:seed:undo` | Removes all seeded data |

**Demo credentials (after seeding):**
- Signin → mobile `+919999900000`, OTP `123456`
- Signup verify → mobile `+919999911111`, OTP `123456`
