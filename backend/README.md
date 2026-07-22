# Pravasi Tours & Travels API

Backend API for a tours and travels booking application.

![Python](https://img.shields.io/badge/python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.135-teal)
![License](https://img.shields.io/badge/license-proprietary-lightgrey)

## Overview

FastAPI service backing the Pravasi Tours & Travels platform. It serves
vehicle listings, generates price quotations using a three-tier distance
resolution strategy (MongoDB cache, Google Maps Distance Matrix API, hardcoded
route table), and records bookings and callback requests in MongoDB.

## Tech stack

| Component | Choice |
|---|---|
| Framework | FastAPI |
| Server | Uvicorn |
| Database | MongoDB (Motor async driver) |
| Validation | Pydantic |
| Rate limiting | slowapi |

## Requirements

- Python 3.11 or later
- A MongoDB instance (Atlas or self-hosted)
- Docker, if running via container

## Quick start

```bash
git clone <repo-url>
cd backend
cp .env.example .env
# edit .env with real values
```

Run with Docker Compose:

```bash
docker compose up -d
```

Or run directly with Uvicorn:

```bash
pip install -r requirements.txt
pip install -e .
uvicorn pravasi_api.main:app --reload --host 0.0.0.0 --port 8000
```

Verify it is running:

```bash
curl http://localhost:8000/api/
```

## Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGO_URL` | yes | none | MongoDB connection string |
| `DB_NAME` | yes | none | MongoDB database name |
| `API_KEY` | yes | none | Shared secret checked by `verify_api_key_header` |
| `GOOGLE_API_KEY` | no | none | Google Maps Distance Matrix API key; falls back to a hardcoded route table if unset |
| `CORS_ORIGINS` | no | `*` | Comma-separated list of allowed origins |

## API endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/` | Health check |
| GET | `/api/vehicles` | List all vehicles |
| GET | `/api/vehicles/{id}` | Get vehicle details |
| POST | `/api/getQuotation` | Generate a price quotation (rate limited, 10/min) |
| GET | `/api/quotations/{id}` | Fetch a quotation by ID |
| POST | `/api/bookings` | Confirm a booking from a quotation |
| POST | `/api/callback` | Submit a callback request |

## Development

Install development dependencies:

```bash
pip install -r requirements-dev.txt
pip install -e .
```

Run tests:

```bash
pytest
```

Run the linter:

```bash
ruff check src/
```

## Deployment

For running the service in a container, see [docs/docker.md](docs/docker.md).
It covers building the image, environment variable injection, health checks,
and local MongoDB setup for development.

For deploying to a server or cloud platform, see
[docs/deployment-production.md](docs/deployment-production.md). It covers
process managers, cloud platform configuration, and the pre-deployment
security checklist.

## Project structure

```
backend/
├── .env.example
├── .gitignore
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
├── requirements.txt
├── requirements-dev.txt
├── README.md
├── docs/
│   ├── docker.md
│   └── deployment-production.md
├── scripts/
│   ├── verify_deployment.py
│   └── verify-deployment.sh
├── src/
│   └── pravasi_api/
│       ├── main.py           # FastAPI app, lifespan, CORS, rate limiter
│       ├── config.py         # env loading and validation
│       ├── database.py       # Mongo client
│       ├── auth.py           # API key verification
│       ├── models.py         # request/response models
│       ├── routers/
│       │   ├── vehicles.py
│       │   ├── quotations.py
│       │   ├── bookings.py
│       │   └── callbacks.py
│       ├── services/
│       │   ├── distance.py   # Google Maps + fallback logic
│       │   └── pricing.py    # price calculation
│       └── data/
│           ├── vehicles.py   # vehicle fleet and pricing data
│           └── routes.py     # hardcoded route distance table
└── tests/
```

## License

Internal project. All rights reserved.
