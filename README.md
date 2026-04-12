# Website Pendaftaran UIB – React + Go

A university registration system with a React (Vite) frontend and a Go backend.

| Layer     | Technology              | Purpose                          |
|-----------|-------------------------|----------------------------------|
| Frontend  | React + Vite            | UI served on port 8989           |
| Backend   | Go + Chi                | REST API served on port 9999     |
| Database  | **MySQL 8**             | User registration data           |
| Tokens    | **MongoDB 7**           | JWT blacklist (logout / revoke)  |

---

## Prerequisites

### For local development
- **Go** 1.21+
- **Node.js** 18+ LTS
- **MySQL** 8.0 (or run it in Docker – see A2 below)
- **MongoDB** 7 (or run it in Docker – see A3 below)
- Optional: **Air** for live reload → `go install github.com/air-verse/air@latest`
- Optional: **golang-migrate** → `go install -tags 'mysql' github.com/golang-migrate/migrate/v4/cmd/migrate@latest`

### For Docker setup
- **Docker Desktop** with WSL2 backend (Windows) **or** Docker Engine (Linux/macOS)

---

## Option A: Local Development (without Docker)

### 1. Clone the repository
```bash
git clone https://github.com/IzayoiKr/pendaftaran-uib.git
cd pendaftaran-uib
```

### 2. Set up MySQL

#### A1. Install MySQL locally
Install MySQL 8 from mysql.com. Then create the database and user:
```sql
CREATE USER 'admin'@'localhost' IDENTIFIED BY '<your-mysql-password-for-admin-user-here>';
CREATE DATABASE `pendaftaran-uib-db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON `pendaftaran-uib-db`.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
```

#### A2. Run MySQL in Docker
```bash
docker run --name mysql-dev \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_USER=admin \
  -e MYSQL_PASSWORD=<your-mysql-password-for-admin-user-here> \
  -e MYSQL_DATABASE=pendaftaran-uib-db \
  -p 3300:3300 \
  -d mysql:8.0 \
  --port=3300
```

### 3. Set up MongoDB

#### A1. Install MongoDB locally
Install MongoDB 7 Community from mongodb.com. Start the service:
```bash
# Linux
sudo systemctl start mongod

# macOS (Homebrew)
brew services start mongodb-community
```

Then open a `mongosh` shell and create the admin user and application database:
```js
// 1. Switch to the admin database to create the root user
use admin

db.createUser({
  user: "<your-mongo-root-account-name>",
  pwd:  "<your-mongo-root-password-here>",
  roles: [{ role: "root", db: "<your-root-database-here>" }]
})

// 2. Switch to the application database and create a dedicated user
use pendaftaran-uib-db

db.createUser({
  user: "admin",
  pwd:  "<your-mongo-admin-password-here>",
  roles: [{ role: "readWrite", db: "pendaftaran-uib-db" }]
})

// 3. Verify
show users
```

> **Note:** After creating users you should enable authentication in your MongoDB config (`/etc/mongod.conf`) by setting `security.authorization: enabled`, then restart the service.
> The local backend `.env` uses `MONGO_URI=mongodb://admin:<your-mongo-admin-password-here>@localhost:27017` once auth is enabled.

#### A2. Run MongoDB in Docker (easier)
```bash
docker run --name mongo-dev \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=<your-mongo-admin-password-here> \
  -e MONGO_INITDB_DATABASE=pendaftaran-uib-db \
  -p 27017:27017 \
  -d mongo:7
```

### 4. Configure backend environment
```bash
cd backend
cp .env.example .env
```
Edit `.env` if your credentials differ from the defaults:
```dotenv
# ─── MySQL ────────────────────────────────────────────────
MYSQL_ROOT_PASSWORD=your-mysql-root-password
MYSQL_USER=admin
MYSQL_PASSWORD=your-mysql-password
MYSQL_DATABASE=pendaftaran-uib-db
MYSQL_PORTS="3300:3300"
MYSQL_PORT=3300

# ─── MongoDB ────────────────────────────────────────────────
MONGO_USER=admin
MONGO_PASSWORD=your-mongo-password
MONGO_DATABASE=pendaftaran-uib-db
MONGO_PORTS="27000:27000"
MONGO_PORT=27000

# ─── Backend ────────────────────────────────────────────────
# Generate with: openssl rand -base64 32
JWT_SECRET=your-very-secret-key-change-this
CORS_ORIGIN=http://localhost:8989
TURNSTILE_SECRET=your_secret_key_here
APP_ENV=development
SERVER_PORT=9999
BACKEND_PORTS="9999:9999"

# ─── Frontend ─────────────────────────────────────────────
FRONTEND_PORTS="8989:8989"
VITE_TURNSTILE_SITE_KEY=your_site_key_here
APP_ENV=development
```

Generate a secure `JWT_SECRET`:
```bash
# Git Bash / WSL / macOS
openssl rand -base64 32

# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### 5. Run database migrations
```bash
# From the backend/ folder
go install -tags 'mysql' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

migrate \
  -path migrations \
  -database "mysql://admin:<your-mysql-password-here>@tcp(localhost:3300)/pendaftaran-uib-db" \
  up
```

### 6. Start the backend
```bash
# From the backend/ folder
go mod download

# Option 1 – Air (live reload, recommended)
air

# Option 2 – plain go run
go run cmd/server/main.go
```
Backend available at **http://localhost:9999**.

### 7. Start the frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend available at **http://localhost:8989**.

---

## Option B: Docker (full stack)

### 1. (WSL2 only) Install Docker
```bash
sudo apt update && sudo apt upgrade -y
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update && sudo apt install -y \
  docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

sudo service docker start
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Configure environment variables
```bash
# From the project root
cp .env.example .env
```
Edit `.env` and set a strong sql password, `JWT_SECRET`, and add turnstile both keys from cloudflare.

### 3. Build and start
```bash
docker compose up --build
# or in background:
docker compose up --build -d
```

### 4. Access the app
| Service    | URL                        |
|------------|----------------------------|
| Frontend   | http://localhost:8989      |
| Backend    | http://localhost:9999      |
| MySQL      | localhost:3300             |
| MongoDB    | localhost:27000            |

### 5. Stop
```bash
docker compose down

# Also delete volumes (resets all data):
docker compose down -v
```
