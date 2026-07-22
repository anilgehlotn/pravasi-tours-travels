# Production deployment

## Overview

- Framework: FastAPI
- Database: MongoDB (Motor async driver)
- Server: Uvicorn
- Entry point: `src/pravasi_api/main.py` (`app`)
- Port: 8000

## Pre-deployment checklist

- All required environment variables set (see `.env.example`)
- `API_KEY` is a strong random value, not the placeholder
- `CORS_ORIGINS` restricted to your frontend domain(s), not `*`
- MongoDB connection string uses `mongodb+srv://` (TLS) for Atlas
- MongoDB Atlas network access allows the deployment platform's IP range

## Required environment variables

```env
MONGO_URL=<YOUR_MONGO_URL>
DB_NAME=pravasi_tours
GOOGLE_API_KEY=your-google-api-key-here
API_KEY=your-api-key-here
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

`GOOGLE_API_KEY` is optional. Without it, distance lookups fall back to a
hardcoded route table.

## Install and run

```bash
cd backend
pip install -r requirements.txt
```

Development, with auto-reload:

```bash
uvicorn pravasi_api.main:app --reload --host 0.0.0.0 --port 8000
```

Production, with multiple workers:

```bash
uvicorn pravasi_api.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Production, with Gunicorn:

```bash
pip install gunicorn
gunicorn pravasi_api.main:app \
  --worker-class uvicorn.workers.UvicornWorker \
  --workers 4 \
  --worker-connections 1000 \
  --bind 0.0.0.0:8000
```

## Docker deployment

See [docker.md](docker.md) for the full container workflow. Summary:

```bash
docker build -t pravasi-backend:latest .
docker run -p 8000:8000 --env-file .env pravasi-backend:latest
```

## Cloud platforms

### Railway / Render

- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn pravasi_api.main:app --host 0.0.0.0 --port $PORT`
- Set environment variables in the platform dashboard, not in code

### Heroku

```bash
echo "web: gunicorn pravasi_api.main:app --worker-class uvicorn.workers.UvicornWorker" > Procfile
git push heroku main
```

### Google Cloud Run

```bash
gcloud run deploy pravasi-backend \
  --image gcr.io/PROJECT/pravasi-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars MONGO_URL=$MONGO_URL,DB_NAME=$DB_NAME
```

### AWS (ECS)

Build the Docker image, push to ECR, create an ECS task definition
referencing it, and put an ALB in front with a health check against `/api/`.

## Security

- Terminate HTTPS at a reverse proxy or the platform's load balancer
- Use a strong, random `API_KEY` (32+ characters): `openssl rand -hex 32`
- Restrict `CORS_ORIGINS` to known frontend domains
- Never commit `.env` — verify with `git log --all --full-history -- .env`
- Monitor logs for repeated 401 and 429 responses

## Monitoring

```bash
uvicorn pravasi_api.main:app --log-level info
```

Key things to alert on:

- Error rate above 5 percent
- Response time (p95) above 1000 ms
- Rate limit hits above 100 per minute
- MongoDB connection failures

## Troubleshooting

**Dependency resolution errors**

```bash
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**MongoDB connection failed**

Check `MONGO_URL` in `.env`. It must be `mongodb+srv://` for Atlas or
`mongodb://` for a local/self-hosted instance.

**Port already in use**

```bash
lsof -ti:8000 | xargs kill -9
```

**Rate limiting not working**

```bash
python -c "from slowapi import Limiter; print('slowapi ok')"
```

## API endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/api/` | |
| GET | `/api/vehicles` | |
| GET | `/api/vehicles/{id}` | |
| POST | `/api/getQuotation` | rate limited, 10/min |
| GET | `/api/quotations/{id}` | |
| POST | `/api/callback` | |
| POST | `/api/bookings` | |

No endpoint currently enforces `X-API-Key` authentication. An
`verify_api_key_header` dependency exists in `auth.py` but is not wired to any
route — treat all endpoints above as public until that is addressed.

## Final verification

```bash
curl http://localhost:8000/api/vehicles
curl http://localhost:8000/docs

# rate limit check — the last few of 15 rapid requests should return 429
for i in $(seq 1 15); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/api/getQuotation \
    -H "Content-Type: application/json" \
    -d '{"vehicle_id":"sedan","from_location":"Mumbai","to_location":"Goa","travel_date":"2026-08-01"}'
done
```
