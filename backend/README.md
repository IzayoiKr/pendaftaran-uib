# Backend

Go REST API for the Pendaftaran UIB application. It handles authentication, email verification, password reset, profile management, rate limiting, audit logging, SQL persistence, and JWT token revocation.

## Stack

- Go 1.25+
- Chi router
- MySQL 8
- MongoDB 7
- JWT
- SMTP email delivery
- golang-migrate database migrations
- Air for optional live reload

## Package Layout

```text
cmd/server/         # API entrypoint, router, middleware wiring
internal/audit/     # Authentication and profile audit logging
internal/auth/      # JWT, middleware, rate limiting, token store, Turnstile
internal/db/        # MySQL and MongoDB connection providers
internal/email/     # SMTP mailer and email templates
internal/handlers/  # HTTP handlers
internal/models/    # Request, response, and database models
internal/utils/     # Shared HTTP, JSON, request, and validation helpers
migrations/         # MySQL schema migrations
```

## Environment

Copy the example file:

```bash
cp .env.example .env
```

Important variables:

| Variable | Purpose |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection |
| `MONGO_URI`, `MONGO_DB` | MongoDB token store connection |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM` | Email delivery |
| `JWT_SECRET`, `JWT_ISSUER` | JWT signing and issuer config |
| `CORS_ORIGIN` | Allowed frontend origin |
| `TURNSTILE_SECRET`, `TURNSTILE_EXPECTED_HOSTNAME` | Cloudflare Turnstile verification |
| `APP_URL` | Public frontend URL used in email links |
| `SERVER_PORT` | API port, normally `9999` |

## Development

Install dependencies:

```bash
go mod download
```

Run migrations:

```bash
go install -tags 'mysql' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

migrate \
  -path migrations \
  -database "mysql://admin:your-mysql-password@tcp(localhost:3300)/pendaftaran-uib-db" \
  up
```

Start the API:

```bash
go run ./cmd/server
```

Start with live reload:

```bash
go install github.com/air-verse/air@latest
air -c .air.toml
```

Run tests:

```bash
go test ./...
```

## Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Health check |
| `POST` | `/api/auth/register` | No | Register user |
| `POST` | `/api/auth/login` | No | Login |
| `POST` | `/api/auth/refresh` | Cookie | Refresh access token |
| `POST` | `/api/auth/logout` | Yes | Logout |
| `POST` | `/api/auth/verify-email` | No | Verify email |
| `POST` | `/api/auth/resend-verification` | No | Resend verification email |
| `POST` | `/api/auth/forgot-password` | No | Request password reset |
| `POST` | `/api/auth/reset-password` | No | Reset password |
| `GET` | `/api/profile` | Yes | Read profile |
| `POST` | `/api/profile` | Yes | Update profile |
| `POST` | `/api/profile/password` | Yes | Change password |
