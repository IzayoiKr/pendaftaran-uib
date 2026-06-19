# Backend

Go REST API for Pendaftaran UIB. It handles authentication, email verification, password reset, profile management, registration submissions, document uploads, ClamAV scanning, LoA generation, major change requests, audit logging, SQL persistence, and JWT token revocation.

## Stack

- Go 1.25+
- Chi router
- MySQL 8
- MongoDB 7
- JWT access and refresh tokens
- SMTP email delivery
- Cloudflare Turnstile verification
- AES-backed NIK encryption and blind indexing
- ClamAV document scanning
- golang-migrate database migrations
- Air for optional live reload

## Package Layout

```text
cmd/server/         # API entrypoint, router, middleware, rate limit wiring
cmd/admincli/       # Operational CLI for registration review and LoA workflows
internal/audit/     # Authentication, profile, and registration audit logging
internal/auth/      # JWT, middleware, rate limiting, token store, Turnstile
internal/clamav/    # ClamAV client
internal/crypto/    # Password peppering, AES encryption, NIK blind index helpers
internal/db/        # MySQL and MongoDB connection providers
internal/email/     # SMTP mailer and email templates
internal/handlers/  # HTTP handlers
internal/i18n/      # Backend validation/error localization
internal/loa/       # LoA fee calculation and generation helpers
internal/middleware/# Request limits and security middleware
internal/models/    # Request, response, and database models
internal/utils/     # Shared HTTP, JSON, request, file, UUID, and validation helpers
migrations/         # MySQL schema migrations and seed data
storage/            # Local uploaded document storage for development
```

## Environment

Copy the example file:

```bash
cp example.env .env
```

Important variables:

| Variable | Purpose |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection |
| `DB_TCP_TIMEOUT`, `DB_READ_TIMEOUT`, `DB_WRITE_TIMEOUT` | MySQL timeout tuning |
| `DB_MAX_OPEN_CONNS`, `DB_MAX_IDLE_CONNS`, `DB_MAX_LIFETIME_MIN`, `DB_MAX_IDLE_LIFETIME_MIN` | MySQL pool tuning |
| `MONGO_URI`, `MONGO_DB` | MongoDB token store connection |
| `MONGO_CONNECT_TIMEOUT`, `MONGO_PING_TIMEOUT` | MongoDB timeout tuning |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_DISABLE_TLS` | Email delivery |
| `JWT_SECRET`, `JWT_ISSUER` | JWT signing and issuer config |
| `CORS_ORIGIN` | Allowed frontend origin |
| `TURNSTILE_SECRET`, `TURNSTILE_EXPECTED_HOSTNAME` | Cloudflare Turnstile verification |
| `BCRYPT_COST`, `PEPPER_KEY` | Password hashing configuration |
| `CRYPTO_AES_KEY`, `NIK_BLIND_INDEX_KEY` | NIK encryption and lookup keys |
| `CLAMD_ADDR` | ClamAV daemon address, for example `tcp://localhost:3310` |
| `APP_ENV`, `APP_URL` | Runtime mode and public frontend URL used in email links |
| `SERVER_PORT` | API port, normally `9999` |
| `STORAGE_DIR` | Directory for uploaded registration files |

Generate secrets with:

```bash
openssl rand -base64 32   # JWT_SECRET
openssl rand -hex 32      # PEPPER_KEY, CRYPTO_AES_KEY, NIK_BLIND_INDEX_KEY
```

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

## Admin CLI

The backend includes an operational CLI for registration review workflows:

```bash
go run ./cmd/admincli list --limit=20
go run ./cmd/admincli verify <registration_id>
go run ./cmd/admincli reject <registration_id> --feedback-document="Missing document"
go run ./cmd/admincli reset <registration_id>
go run ./cmd/admincli loa-set-assessment <registration_id> --usm-rank=1 --scholarship=2
go run ./cmd/admincli prodi-list --status=PENDING --limit=20
go run ./cmd/admincli prodi-approve <request_id>
go run ./cmd/admincli prodi-reject <request_id>
```

The CLI loads `backend/.env` and connects to the same MySQL and MongoDB services as the API.

## Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Health check |
| `GET` | `/api/program_studi` | No | List study programs |
| `GET` | `/api/gelombang` | No | List registration batches |
| `POST` | `/api/auth/register` | No | Register user |
| `POST` | `/api/auth/login` | No | Login |
| `POST` | `/api/auth/refresh` | Cookie | Refresh access token |
| `POST` | `/api/auth/logout` | Yes | Logout and revoke token |
| `POST` | `/api/auth/verify-email` | No | Verify email |
| `POST` | `/api/auth/resend-verification` | No | Resend verification email |
| `POST` | `/api/auth/forgot-password` | No | Request password reset |
| `POST` | `/api/auth/reset-password` | No | Reset password |
| `GET` | `/api/profile` | Yes | Read profile |
| `POST` | `/api/profile` | Yes | Update profile |
| `GET` | `/api/profile/nik` | Yes | Reveal encrypted NIK |
| `POST` | `/api/profile/password` | Yes | Change password |
| `GET` | `/api/registrations/{batchKey}/init` | No | Load registration startup data |
| `GET` | `/api/registrations/{batchKey}/status` | Yes | Read registration status |
| `GET` | `/api/registrations/{regID}` | Yes | Read registration detail |
| `POST` | `/api/registrations/{batchKey}/draft` | Yes | Save draft and documents |
| `POST` | `/api/registrations/{batchKey}/submit` | Yes | Submit registration and documents |
| `DELETE` | `/api/registrations/{batchKey}` | Yes | Delete registration |
| `POST` | `/api/registrations/{batchKey}/withdraw` | Yes | Withdraw registration |
| `GET` | `/api/registrations/{batchKey}/loa` | Yes | Generate or retrieve LoA |
| `GET` | `/api/prodi/{regID}` | Yes | List major change requests |
| `POST` | `/api/prodi/{regID}` | Yes | Request major change |
| `DELETE` | `/api/prodi/{regID}/{requestID}` | Yes | Delete major change request |

## Docker

The root Compose stack builds the `development` target from `backend/Dockerfile`, mounts the backend source into `/app`, uses Air for live reload, and mounts `./storage` for uploaded files.

Run migrations through the Compose tool profile:

```bash
docker compose --profile tools run --rm migrate up
```

See the root [README.md](../README.md) for full-stack Docker and Podman usage.
