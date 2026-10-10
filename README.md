# Quayline

Quayline is a small arrival board. It records a vessel at a berth and lets that arrival move from scheduled to docked to departed.

Nothing in this repository creates cloud resources by itself. Terraform is validated, not applied.

## Run it

```bash
npm test
docker compose up --build
```

The API listens on http://127.0.0.1:8080/health.

```bash
curl -s -X POST http://127.0.0.1:8080/v1/arrivals \
  -H 'content-type: application/json' \
  -d '{"vessel":"Nile Star","berth":"B2"}'
```

Move it with `POST /v1/arrivals/{id}/status` and a status of `docked`, then `departed`. A status can only move one step forward.

## What is included

| Path | Role |
|---|---|
| `src/server.mjs` | HTTP API kept in memory |
| `test/api.test.mjs` | Health, create, and one-step status rules |
| `Dockerfile`, `compose.yaml` | Local image |
| `deploy/terraform` | One ECR repository declaration |
| `.github/workflows/check.yml` | Test, image build, Terraform validate |

The Terraform root uses the AWS provider. Running `terraform apply` needs your own credentials and will create a billable repository. This project does not run apply. The workflow builds the image and does not push it.
