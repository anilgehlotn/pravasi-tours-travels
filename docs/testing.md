# Testing

## Backend

Install dependencies and the package itself:

```bash
cd backend
pip install -r requirements-dev.txt
pip install -e .
```

Run the test suite:

```bash
pytest
```

Run the linter:

```bash
ruff check src/
```

Run the type checker:

```bash
mypy src/
```

### Syntax and import check

```bash
cd backend
python -m py_compile src/pravasi_api/*.py
python -c "from pravasi_api.main import app; print('routes:', len(app.routes))"
```

### Manual endpoint testing

Start the server:

```bash
uvicorn pravasi_api.main:app --reload --host 0.0.0.0 --port 8000
```

Public endpoints:

```bash
curl http://localhost:8000/api/
curl http://localhost:8000/api/vehicles
curl http://localhost:8000/api/vehicles/sedan
```

Generate a quotation:

```bash
curl -X POST http://localhost:8000/api/getQuotation \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": "sedan",
    "from_location": "Bangalore",
    "to_location": "Mysore",
    "travel_date": "2026-08-01",
    "trip_type": "outstation"
  }'
```

Confirm a booking:

```bash
curl -X POST "http://localhost:8000/api/bookings?quote_id=<id-from-quotation>"
```

See [known-issues.md](known-issues.md) — none of the write endpoints above
currently require an API key, despite an API-key mechanism existing in the
codebase.

### Rate limiting

`POST /api/getQuotation` is limited to 10 requests per minute per IP:

```bash
for i in $(seq 1 12); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/api/getQuotation \
    -H "Content-Type: application/json" \
    -d '{"vehicle_id":"sedan","from_location":"Mumbai","to_location":"Goa","travel_date":"2026-08-01"}'
done
```

Requests past the limit return `429` with:

```json
{"detail": "Rate limit exceeded: 10 requests per minute allowed"}
```

### Troubleshooting

**Import fails with a missing environment variable**

`pravasi_api.config` validates `MONGO_URL`, `DB_NAME`, and `API_KEY` at import
time. Copy `backend/.env.example` to `backend/.env` and fill in real values,
or export the variables directly in your shell.

**MongoDB connection errors**

Confirm `MONGO_URL` uses `mongodb+srv://` for Atlas, and that the deploying
network's IP is allow-listed in Atlas Network Access.

## Frontend

See [performance.md](performance.md) for the build and Lighthouse
verification checklist that doubles as a regression test after frontend
changes.
