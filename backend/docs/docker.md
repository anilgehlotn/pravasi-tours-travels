# Docker

## Prerequisites

- Docker and Docker Compose installed
- A `.env` file in `backend/` (copy from `.env.example`)

## Quick start

```bash
cd backend
cp .env.example .env
# edit .env with real values
docker compose up -d
```

Verify the service is running:

```bash
curl http://localhost:8000/api/
curl http://localhost:8000/api/vehicles
```

View logs:

```bash
docker compose logs -f api
```

Stop the service:

```bash
docker compose down
```

## Why secrets are not baked into the image

The Dockerfile never copies `.env` into the image. Environment variables are
injected at container start via `env_file` (Compose) or `-e` flags (`docker run`).
This means the same image can move from dev to staging to production without
rebuilding, and no credential ever gets embedded in a layer that could be
pushed to a registry.

## Running without Compose

```bash
docker build -t pravasi-backend:latest .

docker run -d \
  --name pravasi-backend \
  --env-file .env \
  -p 8000:8000 \
  pravasi-backend:latest
```

Passing variables individually instead of an env file:

```bash
docker run -d \
  --name pravasi-backend \
  -e MONGO_URL="<YOUR_MONGO_URL>" \
  -e DB_NAME="pravasi_tours" \
  -e GOOGLE_API_KEY="your-google-api-key-here" \
  -e API_KEY="your-api-key-here" \
  -e CORS_ORIGINS="*" \
  -p 8000:8000 \
  pravasi-backend:latest
```

## Configuration reference

| Variable | Required | Example |
|---|---|---|
| `MONGO_URL` | yes | `<YOUR_MONGO_URL>` |
| `DB_NAME` | yes | `pravasi_tours` |
| `API_KEY` | yes | generated with `openssl rand -hex 32` |
| `GOOGLE_API_KEY` | no | `your-google-api-key-here` (falls back to hardcoded route data if unset) |
| `CORS_ORIGINS` | no | `*` or a comma-separated origin list |

## Advanced Compose configuration

### Custom port mapping

```yaml
services:
  api:
    ports:
      - "8001:8000"
```

### Resource limits

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 1G
        reservations:
          cpus: "0.5"
          memory: 512M
```

### Local MongoDB for development

The provided `docker-compose.yml` includes a commented-out `mongo` service.
Uncomment it and point `MONGO_URL` at `mongodb://mongo:27017/` to avoid
depending on Atlas during local development.

## Security hardening

Rotate the API key before any production deployment:

```bash
openssl rand -hex 32
```

Update `.env` (or the platform's secret store) with the new value and restart
the container. For Docker Swarm, prefer secrets files over environment
variables:

```yaml
services:
  api:
    secrets:
      - api_key
    environment:
      API_KEY_FILE: /run/secrets/api_key

secrets:
  api_key:
    file: ./secrets/api_key.txt
```

Terminate TLS at a reverse proxy (Nginx, Caddy, or the platform's load
balancer) rather than in the application container.

## Troubleshooting

**Service will not start**

```bash
docker compose logs api
docker compose config
docker compose up -d --build
```

**Port already in use**

```bash
lsof -i :8000
kill -9 <PID>
```

**Database connection error**

```bash
docker compose exec api env | grep MONGO_URL
docker compose exec api python -c "import motor.motor_asyncio; print('motor import ok')"
```

## Monitoring

```bash
docker stats pravasi-backend
docker compose logs --timestamps -f api
```

## Backup and restore

```bash
# backup
docker exec pravasi-mongo mongodump --out ./backup

# restore
docker exec pravasi-mongo mongorestore ./backup
```
