# Pendaftaran UIB

Full-stack registration system for Universitas Internasional Batam. The repository contains a Next.js frontend, a Go REST API, MySQL schema migrations, MongoDB-backed token revocation, SMTP email delivery, Cloudflare Turnstile verification, encrypted NIK handling, and ClamAV document scanning.

## Stack

| Layer | Technology | Default URL / Port |
| --- | --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, SCSS, pnpm | http://localhost:8989 |
| Backend | Go 1.25, Chi, JWT, SMTP | http://localhost:9999 |
| SQL database | MySQL 8 | localhost:3300 |
| Token store | MongoDB 7 | localhost:27000 |
| File scanning | ClamAV with Fangfrisch signatures | localhost:3310 |
| Email sandbox | Mailpit or Mailtrap | http://localhost:6969 for Mailpit |
| Database tools | phpMyAdmin, mongo-express | http://localhost:8081, http://localhost:8082 |

## Repository Layout

```text
.
|-- backend/              # Go API, migrations, admin CLI, email templates
|-- frontend/             # Next.js application
|-- fangfrisch/           # ClamAV third-party signature updater config
|-- docker-compose.yaml   # Docker Compose development stack
|-- podman-compose.yml    # Podman variant of the development stack
|-- example.env           # Root Compose environment template
`-- README.md
```

Folder-specific documentation:

- [backend/README.md](backend/README.md)
- [frontend/README.md](frontend/README.md)

## Prerequisites

For the containerized stack:

- Docker Engine or Docker Desktop with Compose plugin, or Podman with podman-compose
- Enough memory for ClamAV. The example config reserves up to `3G`.

For local development without containers:

- Go 1.25+
- Node.js 22+
- Corepack or pnpm 11+
- MySQL 8
- MongoDB 7
- ClamAV daemon reachable by the backend
- Optional: Air for Go live reload
- Optional: golang-migrate for database migrations

## Quick Start

1. Copy and edit the root environment file.

```bash
cp example.env .env
```

Set the real secret values before starting the stack:

```dotenv
MYSQL_ROOT_PASSWORD=your-mysql-root-password
MYSQL_PASSWORD=your-mysql-password
MONGO_PASSWORD=your-mongo-password
MONGO_URI=mongodb://admin:your-mongo-password@mongodb:27000
JWT_SECRET=your-long-random-secret
PEPPER_KEY=your-hex-encoded-pepper-key
CRYPTO_AES_KEY=your-hex-encoded-aes-key
NIK_BLIND_INDEX_KEY=your-hex-encoded-blind-index-key
TURNSTILE_SECRET=your-cloudflare-turnstile-secret
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-cloudflare-turnstile-site-key
```

For local email capture with the included Mailpit service:

```dotenv
SMTP_HOST=mailpit
SMTP_PORT=1025
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_DISABLE_TLS=true
```

2. Build and start the full stack.

```bash
docker compose up --build
```

For Podman:

```bash
podman-compose -f podman-compose.yml up --build
```

3. Apply MySQL migrations.

```bash
docker compose --profile tools run --rm migrate up
```

For Podman:

```bash
podman-compose -f podman-compose.yml --profile tools run --rm migrate up
```

4. Open the services.

| Service | URL |
| --- | --- |
| Frontend | http://localhost:8989 |
| Backend health check | http://localhost:9999/health |
| Mailpit | http://localhost:6969 |
| phpMyAdmin | http://localhost:8081 |
| mongo-express | http://localhost:8082 |

Stop the stack:

```bash
docker compose down
```

Reset container databases and ClamAV signature volumes:

```bash
docker compose down -v
```

## Local Development

Use this flow when you want the backend and frontend processes running directly on your machine.

### 1. Start Dependencies

Create a MySQL database and user:

```sql
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'your-mysql-password';
CREATE DATABASE `pendaftaran-uib-db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON `pendaftaran-uib-db`.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
```

If you run MySQL in Docker:

```bash
docker run --name mysql-pendaftaran-uib-dev \
  -e MYSQL_ROOT_PASSWORD=your-mysql-root-password \
  -e MYSQL_USER=admin \
  -e MYSQL_PASSWORD=your-mysql-password \
  -e MYSQL_DATABASE=pendaftaran-uib-db \
  -p 3300:3300 \
  -d mysql:8.0 \
  --port=3300
```

If you run MongoDB in Docker:

```bash
docker run --name mongodb-pendaftaran-uib-dev \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=your-mongo-password \
  -e MONGO_INITDB_DATABASE=pendaftaran-uib-db \
  -p 27000:27000 \
  -d mongo:7 \
  mongod --port 27000 --auth
```

Start ClamAV separately or use the Compose `clamav` service. The backend expects `CLAMD_ADDR`, for example:

```dotenv
CLAMD_ADDR=tcp://localhost:3310
```

### 2. Run the Backend

```bash
cd backend
cp example.env .env
go mod download
```

Edit `backend/.env` so MySQL, MongoDB, SMTP, CORS, Turnstile, crypto keys, ClamAV, and storage paths match your machine.

Apply migrations:

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

With live reload:

```bash
go install github.com/air-verse/air@latest
air -c .air.toml
```

### 3. Run the Frontend

```bash
cd frontend
cp example.env.local .env.local
corepack enable
pnpm install
pnpm dev
```

Open http://localhost:8989.

## Useful Commands

```bash
# Backend
cd backend
go test ./...
go run ./cmd/server
go run ./cmd/admincli list --limit=20

# Frontend
cd frontend
pnpm dev
pnpm lint
pnpm typecheck
pnpm tsec-security
pnpm build

# Docker
docker compose up --build
docker compose --profile tools run --rm migrate up
docker compose --profile tools run --rm migrate down
docker compose --profile tools run --rm mongo-reset
```

## Environment Files

| File | Purpose |
| --- | --- |
| `example.env` | Root Docker/Podman Compose environment template |
| `backend/example.env` | Backend-only local development template |
| `frontend/example.env.local` | Frontend-only local development template |

Do not commit real `.env`, `.env.local`, database passwords, JWT secrets, SMTP credentials, Turnstile keys, or encryption keys.

## Main API Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Health check |
| `GET` | `/api/program_studi` | No | List study programs |
| `GET` | `/api/gelombang` | No | List registration batches |
| `POST` | `/api/auth/register` | No | Register a user |
| `POST` | `/api/auth/login` | No | Login |
| `POST` | `/api/auth/refresh` | Cookie | Refresh access token |
| `POST` | `/api/auth/logout` | Yes | Logout and revoke token |
| `POST` | `/api/auth/verify-email` | No | Verify email address |
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
| `POST` | `/api/registrations/{batchKey}/draft` | Yes | Save draft with uploaded documents |
| `POST` | `/api/registrations/{batchKey}/submit` | Yes | Submit registration with uploaded documents |
| `DELETE` | `/api/registrations/{batchKey}` | Yes | Delete registration |
| `POST` | `/api/registrations/{batchKey}/withdraw` | Yes | Withdraw registration |
| `GET` | `/api/registrations/{batchKey}/loa` | Yes | Generate or retrieve LoA |
| `GET` | `/api/prodi/{regID}` | Yes | List major change requests |
| `POST` | `/api/prodi/{regID}` | Yes | Request major change |
| `DELETE` | `/api/prodi/{regID}/{requestID}` | Yes | Delete major change request |
