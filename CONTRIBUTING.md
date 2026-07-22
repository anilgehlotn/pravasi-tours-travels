# Contributing

## Branch naming

Prefix branches with the type of change:

- `feat/` — new functionality
- `fix/` — bug fix
- `chore/` — maintenance, dependencies, tooling
- `docs/` — documentation only
- `refactor/` — code change with no behavior change

Example: `feat/b2b-invoice-export`

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(backend): add distance cache invalidation endpoint
fix(frontend): correct rounding in outstation price breakdown
docs: update backend environment variable reference
```

Keep the subject line under 72 characters. Explain the *why* in the body if
the change is not self-evident from the diff.

## Before opening a pull request

- Tests pass: `pytest` (backend), and the frontend build succeeds
- Lint is clean: `ruff check src/` (backend)
- No secrets in the diff — connection strings, API keys, passwords
- Documentation updated if the change affects setup, configuration, or
  a documented endpoint

## Local setup

See [backend/README.md](backend/README.md) for the API service and
[frontend/README.md](frontend/README.md) for the web client. Each has its
own environment variables and run instructions.

## Scope

Keep pull requests scoped to one concern. A bug fix should not also carry an
unrelated refactor — open a separate PR instead.
