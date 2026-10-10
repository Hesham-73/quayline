# Quayline

Quayline is a small arrival board with its delivery path: API, tests, container image, Kubernetes manifests, and a Terraform example.

Nothing in this repository creates cloud resources by itself. Terraform is validated, not applied. The image is built and smoked in CI. It is not pushed.

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
| `deploy/k8s` | Namespace, config, deployment, and service |
| `deploy/terraform` | One ECR repository declaration |
| `.github/workflows/check.yml` | Test, image smoke, manifest render, Terraform validate |

The Kubernetes service is meant to reach the API pods. The deployment listens on port 8080 and uses `/health` for both probes.

The Terraform root uses the AWS provider. Running `terraform apply` needs your own credentials and will create a billable repository. This project does not run apply.
