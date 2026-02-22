# Website Pendaftaran UIB – React + Go

This is a monorepo for a university registration system with a React (Vite) frontend and a Go backend using PostgreSQL.

The project is designed to run both locally (for development) and inside Docker containers (for testing/production simulation).

*   **Local development** – run PostgreSQL locally (or in a Docker container), start the backend with live reload (Air), and run the Vite dev server.
*   **Docker setup** – use Docker Desktop with WSL2 backend to run the whole stack with `docker-compose`.

## Prerequisites

Make sure the following tools are installed:

### Required for both approaches
*   A terminal (PowerShell, Command Prompt, Git or WSL)

### For local development (without full Docker)
*   **Go** (1.21+)
*   **Node.js** (18+ LTS)
*   **PostgreSQL** (15+) – or you can run PostgreSQL in a Docker container (see notes below)
*   Optional but recommended: **Air** for live reload of Go (install with `go install github.com/cosmtrek/air@latest`)

### For Docker setup (Choose one)
*   **Docker Desktop** with WSL2 backend enabled (recommended for Windows)
*   **WSL2** (if you prefer to run commands inside a Linux environment) – Docker Desktop can also run containers natively on Windows, but WSL2 gives better performance.

> **Note**: If you use Docker, you don’t need to install Go, Node.js, or PostgreSQL separately – everything runs in containers.

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/IzayoiKr/pendaftaran-uib.git
cd pendaftaran-uib
```

## Option A: Local Development (without Docker)

### 2. Set up the database
You have two choices for **PostgreSQL**:

#### A1. Install PostgreSQL locally
*   Download and run the installer from postgresql.org.
*   During installation, set a password for the default **superuser** `postgres` (remember it, e.g., `postgres`). You'll use this to create the application user and database.
*   After installation, open **SQL Shell (psql)** or run:
```bash
psql -U postgres -h localhost
```
*   Inside psql, create the database user `admin` with password `babualdo` and the database:
```bash
CREATE USER admin WITH PASSWORD 'babualdo';
CREATE DATABASE "pendaftaran-uib-db" OWNER admin;
GRANT ALL PRIVILEGES ON DATABASE "pendaftaran-uib-db" TO admin;
\q
```

#### A2. Run PostgreSQL in a Docker container (easier, no local install)
If you have Docker Desktop, you can start a PostgreSQL container:
```bash
docker run --name postgres-dev \
    -e POSTGRES_USER=admin \
    -e POSTGRES_PASSWORD=babualdo \
    -e POSTGRES_DB=pendaftaran-uib-db \
    -p 5432:5432 \
    -d postgres:15
```
This container will keep running in the background. To stop it and remove it later: 
```bash
docker stop postgres-dev && docker rm postres-dev
```

### 3. Configure backend environment
Navigate to the `backend` folder and create a `.env` file:
```bash
cd backend
copy .env.example .env   # on Windows Command Prompt
# or
cp .env.example .env     # if using Git / WSL / bash
```
Edit `.env` with your database credentials. If you used the Docker command above, the default values work:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=babualdo
DB_NAME=pendaftaran-uib-db
DB_SSLMODE=disable
JWT_SECRET=your-very-secret-key-change-this
SERVER_PORT=8888
```
> Generate JWT_SECRET key with:
> * PowerShell:
`-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})`
> * Command Prompt (needs Node.js): 
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
> * Git Bash/WSL2: 
`openssl rand -base64 32`

### 4. Run database migrations
We use `golang-migrate` to create the tables. Install the `migrate` tool (one time):
```bash
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
```
Then run the migrations (make sure you're in the `backend` folder):
```bash
migrate -path migrations -database "postgres://admin:babualdo@localhost:5432/pendaftaran-uib-db?sslmode=disable" up
```
You should see a success message `1/u create_users_table`.

### 5. Install backend dependencies and start the server
While still in the `backend` folder:
```bash
go mod download
```
Now start the server. You have two options:
* Using Air (recommended for development – auto‑restarts on file changes):
```bash
air
```
If you don't have Air, install it first: `go install github.com/cosmtrek/air@latest`
* Using plain `go run`:
```bash
go run cmd/server/main.go
```
The backend will start on http://localhost:8888.

### 6. Set up and run the frontend
Open a new terminal (keep the backend running) and go to the `frontend` folder:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
The Vite dev server will start on http://localhost:8989.
It proxies API requests starting with /api to the backend at http://localhost:8888.

Open http://localhost:8989 in your browser.

## Option B: Run Everything with Docker (using WSL2)
This method builds and runs the entire stack (PostgreSQL, Go backend, React frontend) in containers.

### 1. Setup Docker in WSL2
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install docker
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
**Start Docker and enable it to run at boot**
```bash
sudo service docker start
# (Optional) To have Docker start automatically whenever you open WSL, add the start command to your shell profile (~/.bashrc or ~/.zshrc)
echo 'sudo service docker start' >> ~/.bashrc
```
**Add your user to the `docker` group (so you can run `docker` without `sudo`)**
```bash
sudo usermod -aG docker $USER
```
**Log out of WSL (type `exit` or `Ctrl+D`) and restart your WSL terminal for the group change to take effect. You can also run `newgrp docker` in the current session.**
> After this, don't forget to git clone repo.

### 2. Environment variables for docker
Docker Compose reads environment variables from the `docker-compose.yml` file. The backend service is configured with these values:
*   `DB_HOST=postgres`
*   `DB_USER=${POSTGRES_USER}`
*   `DB_PASSWORD=${POSTGRES_PASSWORD}`
*   `JWT_SECRET=your-very-secret-key-change-this` – you should change this in the `.env.example` and rename it to `.env` before running.

If you want to change any variable, you can change in `.env` file in the **project root** (not inside `backend`) with the same keys. Docker Compose will automatically pick it up.

### 3. Build and start the containers
In the **project root** (where `docker-compose.yml` is located), run:
```bash
docker compose up --build
# or run in the background:
docker compose up --build -d
```

### 5. Access the application
*   **Frontend**: http://localhost:8989
*   **Backend API**: http://localhost:8888 (direct access, though frontend proxies through /api)

### 6. Stopping the containers
Press `Ctrl+C` in the terminal where `docker compose up` is running and run:
```bash
docker compose down
```
To also delete the database volume (reset all data), add the `-v` flag:
```bash
docker compose down -v
```

