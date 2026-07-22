# LoadService API Gateway

The API Gateway is a small Go reverse proxy that presents one REST and Socket.IO entrypoint for the LoadService dashboard. It reads a JSON route map at startup and forwards HTTP paths and Socket.IO transports to the configured Common, Attack, or Payment service.

## Project Map

| File | Responsibility |
|---|---|
| `main.go` | Configuration loading, prefix matching, reverse proxying, and HTTP server startup |
| `config.json` | HTTP module and Socket.IO upstream route map |
| `.env.example` | Configuration file path and listen port |
| `Dockerfile` | Static Linux binary and non-root Alpine runtime image |

## Main Features

- Standard-library `httputil.ReverseProxy` with minimal runtime dependencies.
- Exact or child-path prefix matching, preventing accidental partial module matches.
- Original request paths are preserved when forwarding.
- Upstream failures return HTTP `502`; unmapped paths return `404`.
- A 10-second request-header timeout is configured.

Socket.IO routes use distinct transport paths so the gateway can select the correct backend before the namespace handshake:

| Public transport path | Upstream | Namespace used by the client |
|---|---|---|
| `/socket.io/common` | Common service | `/tickets` |
| `/socket.io/attack` | Attack service | `/events` |
| `/socket.io/payment` | Payment service | `/payments` |

## Route Map

The checked-in `config.json` maps these modules:

| Backend | Modules |
|---|---|
| Common | `auth`, `users`, `roles`, `permissions`, `features`, `news`, `plans`, `tickets` |
| Attack | `attacks`, `methods`, `networks`, `servers` |
| Payment | `payments` |

Each value must include the complete upstream prefix, for example:

```json
{
  "modules": {
    "auth": "http://127.0.0.1:3000/api/v1/auth",
    "attacks": "http://127.0.0.1:4000/api/v1/attacks",
    "payments": "http://127.0.0.1:5000/api/v1/payments"
  },
  "sockets": {
    "/socket.io/common": "http://127.0.0.1:3000",
    "/socket.io/attack": "http://127.0.0.1:4000",
    "/socket.io/payment": "http://127.0.0.1:5000"
  }
}
```

The gateway uses the URL path as the public prefix and the scheme/host as the proxy destination. Duplicate paths overwrite one another at startup, so every module path should be unique.

Socket entries must use a `/socket.io/<name>` key and an upstream origin. The gateway rewrites that public transport path to the backend's standard `/socket.io/` path while preserving polling, upgrade, and WebSocket requests.

## Prerequisites

- Go `1.26.5` or a compatible newer release.
- Reachable LoadService backend origins.

## Configuration

```bash
cp .env.example .env
```

| Variable | Default example | Purpose |
|---|---|---|
| `PROXY_CONFIG` | `config.json` | Path to the JSON module map, relative to the working directory |
| `LISTEN_PORT` | `8080` | HTTP port bound on `0.0.0.0` |

Update `config.json` for the network where the process runs. `localhost` inside a container refers to that container, not the host or another Compose service.

## Run

```bash
go mod download
go run .
```

The usual REST base URL is:

```text
http://localhost:8080/api/v1
```

Example check:

```bash
curl http://localhost:8080/api/v1/plans
```

## Docker

```bash
docker build -t loadservice-api-gateway .
docker run --rm -p 8080:8080 --env-file .env \
  -v "$(pwd)/config.json:/app/config.json:ro" \
  loadservice-api-gateway
```

The image is a non-root `scratch` image containing only the static binary and CA certificates. `PROXY_CONFIG`, `LISTEN_PORT`, and the route map remain runtime configuration; neither environment defaults nor `config.json` are baked into the image.

The repository-level `docker-compose.go.yml` can also run the published gateway image and mounts the local route map.

## Useful Checks

```bash
gofmt -w main.go
go test ./...
go vet ./...
go build ./...
```

## Troubleshooting

- `.env` is optional when variables are supplied by the shell, Compose, or another runtime environment.
- Startup rejects the config: confirm valid JSON, a non-empty `modules` object, and upstream URLs with path components.
- Request returns `404`: the request path does not equal a configured prefix or begin with `<prefix>/`.
- Request returns `502`: the route matched, but its upstream scheme/host was unreachable.
- Socket.IO does not connect: verify the client uses the matching `/socket.io/<name>` transport path and that the configured backend origin is reachable from the gateway.
- Docker cannot reach a host service: use a reachable host address or shared Docker network instead of container-local `127.0.0.1`.

## Notes For Development

- Configuration is loaded only at startup; restart after editing `config.json`.
- There is currently no authentication, rate limiting, TLS termination, health endpoint, or hot reload in this component.
- Swagger `/api-docs` and the prefixless SePay callback are not in the checked-in module map.
