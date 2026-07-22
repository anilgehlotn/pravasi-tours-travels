# Pravasi Tours & Travels

Vehicle booking, quotation, and ERP platform for a tours and travels business.

![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.135-teal)

## Overview

This repository contains a customer-facing booking platform — a FastAPI
service that generates distance-based price quotations and handles bookings,
paired with a web frontend — plus a separate ERP subproject for internal
operations (drivers, vehicles, B2B billing, and an admin dashboard).

## Repository structure

```
.
├── backend/          # FastAPI booking service
├── frontend/         # Web client
├── ERP-SYSTEM/       # ERP subproject (separate backend + frontend)
├── scripts/          # Repo-wide utility scripts
├── docs/             # Repo-wide documentation
└── tests/            # Cross-service tests
```

## Getting started

Each service has its own setup instructions. See
[backend/README.md](backend/README.md) for the booking API (environment
variables, Docker, running locally) and [frontend/README.md](frontend/README.md)
for the web client. The ERP subproject under `ERP-SYSTEM/` has its own
backend and frontend, each with its own dependencies.

## Documentation

- [docs/performance.md](docs/performance.md) — frontend bundle size and
  load performance
- [docs/testing.md](docs/testing.md) — backend and frontend testing
  procedures

## Live demo

The ERP-SYSTEM admin dashboard:

**Dashboard:** [https://pravasi-tours-travels-1xdh.vercel.app/dashboard](https://pravasi-tours-travels-1xdh.vercel.app/dashboard)

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `pravasi@123` |

## License

MIT. See [LICENSE](LICENSE).
