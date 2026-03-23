## Personal Project Website (DevOps Practice)

Full-stack starter for DevOps practice:

- **Frontend**: React (Vite)
- **Backend**: Node.js (Express) + **mysql2** (plain SQL, no ORM)
- **DB**: MySQL (Docker)

### What you get

- Local dev with `docker compose` (DB) + hot reload apps
- Containerized prod-like run (frontend + backend + mysql)
- DB schema + seed on backend startup (see `backend/src/db.ts`)
- Health endpoints for readiness/liveness checks

---

## Quickstart (local dev)

### Prereqs

- Node.js 20+
- Docker Desktop

### 1) Start MySQL

```bash
docker compose up -d db
```

### 2) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend runs at `http://localhost:8080`.

### 3) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Run everything in containers

```bash
docker compose up --build
```

---

## Useful DevOps practice ideas

- Add CI: lint, test, build Docker images
- Add CD: deploy to a VM, Fly.io, Render, or ECS
- Add observability: request logs, metrics, traces
- Add DB backups + restore procedure
- Add secret management and `.env` separation

