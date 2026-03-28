# Splitr

Full-stack expense-splitting app — monorepo with React frontend and Spring Boot backend.

## Prerequisites

- **Docker** (required for one-command startup)
- **Node.js** 20+ and **Java** 21+ (only for local development without Docker)

## Quick Start (Docker)

Run the entire stack with a single command:

```bash
docker compose up --build
```

This starts **Postgres**, **backend**, and **frontend** together.
Open `http://localhost:5173` in your browser.

To run in the background:

```bash
docker compose up --build -d
```

Stop everything:

```bash
docker compose down
```

## Local Development

For faster iteration, run services individually:

### 1. Start the database

```bash
docker compose up postgres -d
```

### 2. Start the backend

```bash
cd backend
./gradlew bootRun
```

API: `http://localhost:8080` | Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Generate the API client

```bash
cd scripts
./generate-api.sh
```

Reads `shared/openapi.yaml` and generates a typed client into `frontend/src/api/`.

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## Project Structure

```
splitr/
├── frontend/          # React + TypeScript + Tailwind (Vite)
├── backend/           # Spring Boot + Java + Gradle
├── shared/            # OpenAPI spec (single source of truth)
│   └── openapi.yaml
├── scripts/
│   └── generate-api.sh
├── docker-compose.yml
└── README.md
```

## API Contract (Code-First)

The backend auto-generates the OpenAPI spec from controller annotations via Springdoc. The workflow:

1. Write or update a controller in the backend
2. Run `scripts/generate-api.sh` (requires backend to be running)
3. The script fetches the spec from `GET /v3/api-docs.yaml`, saves it to `shared/openapi.yaml`, and generates the typed frontend client

## Configuration

| Service  | Port |
|----------|------|
| Frontend | 5173 |
| Backend  | 8080 |
| Postgres | 5432 |

Database credentials: `splitr` / `splitr` / `splitr` (db / user / password).
