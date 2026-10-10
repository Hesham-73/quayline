# Delivery

Local checks and the container image are the runnable path. Kubernetes manifests describe the same API: one replica, port 8080, and probes on `/health`.

The service named `quayline` is the in-cluster address for those pods. Render the dev overlay with:

```bash
kubectl kustomize deploy/k8s/overlays/dev
```

Rendering succeeds when the YAML is valid. It does not prove that a live cluster is serving traffic.

Terraform in `deploy/terraform` declares the image repository only. CI runs `terraform validate` with `-backend=false`. It does not plan or apply.
