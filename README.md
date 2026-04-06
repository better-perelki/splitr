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

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | JDBC connection string | `jdbc:postgresql://localhost:5432/splitr` |
| `SPRING_DATASOURCE_USERNAME` | Database user | `splitr` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `splitr` |
| `JWT_SECRET` | HMAC-SHA256 signing key (min 256 bits) | dev-only key (see `application.yml`) |
| `UPLOAD_DIR` | Directory for uploaded files (avatars) | `./uploads` |

`JWT_SECRET` **must** be overridden in production with a strong random value. The access token expires in 15 minutes, the refresh token in 7 days (configurable via `app.jwt.access-token-expiration` / `app.jwt.refresh-token-expiration` in ms).

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend URL (used only in `.env`) | `http://localhost:8080` |
