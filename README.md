## Personal Project Website (DevOps Practice)

Full-stack starter for DevOps practice:

- **Frontend**: React + Vite
- **Backend**: Node.js + Express + `mysql2` (plain SQL, no ORM)
- **Database**: MySQL 8 (Docker)

The backend creates tables and seeds sample data on startup (`backend/src/db.ts`).

---

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop (or Docker Engine + Compose)

---

## Environment Variables

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and set:

- `PORT=8080`
- `NODE_ENV=development`
- `DATABASE_URL=mysql://app:app_password@localhost:3306/personal_project`
- `WEB_ORIGIN=http://localhost:5173`

Notes:
- Use `localhost` in `DATABASE_URL` for local dev (backend runs on your host machine).
- In Docker Compose, backend uses `DATABASE_URL=mysql://app:app_password@db:3306/personal_project` (`db` is the service name).

### Frontend (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env` and set:

- `VITE_API_BASE=http://localhost:8080` for local backend dev

Notes:
- In Docker Compose build args, frontend uses `VITE_API_BASE=http://localhost:8081`.
- That is because backend container port `8080` is published as host port `8081`.

---

## Local Development (Recommended for coding)

### 1) Start MySQL only

```bash
docker compose up -d db
```

### 2) Run backend locally

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend URL: `http://localhost:8080`  
Health checks: `http://localhost:8080/healthz` and `http://localhost:8080/readyz`

### 3) Run frontend locally

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

---

## Run Entire Stack in Docker

```bash
docker compose up --build
```

Service URLs:
- Frontend: `http://localhost:5173`
- Backend (published): `http://localhost:8081`
- MySQL: `localhost:3306`

Important compose values currently used:
- Backend env:
  - `PORT=8080`
  - `NODE_ENV=production`
  - `DATABASE_URL=mysql://app:app_password@db:3306/personal_project`
  - `WEB_ORIGIN=http://localhost:5173`
- Frontend build arg:
  - `VITE_API_BASE=http://localhost:8081`

---

## Common Commands

```bash
# stop containers
docker compose down

# stop and remove DB volume (fresh database)
docker compose down -v

# rebuild all images
docker compose build --no-cache
```

