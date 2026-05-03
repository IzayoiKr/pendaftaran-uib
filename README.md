# Pendaftaran UIB

Pendaftaran UIB is a full-stack university registration application for Universitas Internasional Batam. The project contains a Next.js frontend, a Go REST API, MySQL for registration data, MongoDB for token revocation, and SMTP email delivery for account verification and password reset flows.

## Tech Stack

| Layer | Technology | Default URL / Port |
| --- | --- | --- |
| Frontend | Next.js, React, TypeScript, SCSS | http://localhost:8989 |
| Backend | Go, Chi, JWT | http://localhost:9999 |
| SQL database | MySQL 8 | localhost:3300 in Docker |
| Token store | MongoDB 7 | localhost:27000 in Docker |
| Email sandbox | Mailpit or Mailtrap | http://localhost:6969 for Mailpit |
| Database tools | phpMyAdmin, mongo-express | http://localhost:8081, http://localhost:8082 |

## Repository Layout

```text
.
|-- backend/          # Go API, database migrations, email templates
|-- frontend/         # Next.js application
|-- docker-compose.yml
|-- .env.example      # Docker Compose environment template
`-- README.md
```

Keep this root README focused on running the complete project. Folder-specific notes belong in:

- [backend/README.md](backend/README.md)
- [frontend/README.md](frontend/README.md)

## Prerequisites

For Docker development:

- Docker Engine or Docker Desktop
- Docker Compose plugin

For local development without Docker:

- Go 1.25+
- Node.js 22+
- MySQL 8
- MongoDB 7
- Optional: Air for Go live reload
- Optional: golang-migrate for database migrations

## Quick Start With Docker

This is the simplest way to run the full stack.

1. Copy the root environment file.

```bash
cp .env.example .env
```

2. Edit `.env`.

Set at least these values:

```dotenv
MYSQL_ROOT_PASSWORD=your-mysql-root-password
MYSQL_PASSWORD=your-mysql-password
MONGO_PASSWORD=your-mongo-password
JWT_SECRET=your-long-random-secret
TURNSTILE_SECRET=your-cloudflare-turnstile-secret
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-cloudflare-turnstile-site-key
```

For local email testing, Mailpit is included in Docker Compose. Use:

```dotenv
SMTP_HOST=mailpit
SMTP_PORT=1025
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_DISABLE_TLS=true
```

3. Build and start the services.

```bash
docker compose up --build
```

4. Run MySQL migrations.

```bash
docker compose --profile tools run --rm migrate up
```

5. Open the app.

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

Reset Docker database volumes:

```bash
docker compose down -v
```

## Local Development

Use this path if you want to run the backend and frontend directly on your machine.

### 1. Start MySQL

Create the database and user:

```sql
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'your-mysql-password';
CREATE DATABASE `pendaftaran-uib-db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON `pendaftaran-uib-db`.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
```

If you run MySQL in Docker instead:

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

### 2. Start MongoDB

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

Use this URI for the local backend when using the Docker command above:

```dotenv
MONGO_URI=mongodb://admin:your-mongo-password@localhost:27000/pendaftaran-uib-db?authSource=admin
```

### 3. Configure and run the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` so the database, SMTP, JWT, CORS, and Turnstile values match your local setup.

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
go mod download
go run ./cmd/server
```

With Air:

```bash
go install github.com/air-verse/air@latest
air -c .air.toml
```

### 4. Configure and run the frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open http://localhost:8989.

## Useful Commands

```bash
# Backend
cd backend
go test ./...
go run ./cmd/server

# Frontend
cd frontend
npm run dev
npm run lint
npm run typecheck
npm run build

# Docker
docker compose up --build
docker compose --profile tools run --rm migrate up
docker compose --profile tools run --rm migrate down
docker compose --profile tools run --rm mongo-reset
```

## Environment Files

| File | Purpose |
| --- | --- |
| `.env.example` | Root Docker Compose environment template |
| `backend/.env.example` | Backend-only local development template |
| `frontend/.env.local.example` | Frontend-only local development template |

Do not commit real `.env`, `.env.local`, database passwords, JWT secrets, SMTP credentials, or Turnstile keys.

## Main Backend Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `POST` | `/api/auth/logout` | Logout and revoke token |
| `POST` | `/api/auth/verify-email` | Verify email address |
| `POST` | `/api/auth/resend-verification` | Resend verification email |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset password |
| `GET` | `/api/profile` | Get authenticated user profile |
| `POST` | `/api/profile` | Update authenticated user profile |
| `POST` | `/api/profile/password` | Change authenticated user password |
