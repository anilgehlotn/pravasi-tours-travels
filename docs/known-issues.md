# Known issues

## Authentication not enforced on backend write endpoints

`verify_api_key_header` is defined in
`backend/src/pravasi_api/auth.py` but is not attached via `Depends()` to any
route.

**Affected endpoints:**

- `POST /api/getQuotation`
- `GET /api/quotations/{id}`
- `POST /api/bookings`
- `POST /api/callback`

**Impact:** these endpoints are publicly callable without an API key,
despite the presence of API-key infrastructure (`API_KEY` environment
variable, `verify_api_key_header` dependency, and documentation elsewhere
that describes them as protected).

**Status:** known. Preserved as-is during the backend refactor to avoid
introducing a behavior change outside the scope of that work. Requires a
deliberate fix.

**Suggested fix:** add `dependencies=[Depends(verify_api_key_header)]` to
the affected router's `include_router()` call, or to each route
individually, then update any client or frontend code that calls these
endpoints to send an `X-API-Key` header.
