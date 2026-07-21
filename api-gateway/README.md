# LoadService Reverse Proxy

> A lightweight Go routing layer that exposes a single REST entry point for the LoadService frontend.

The proxy maps API module prefixes to the Common, Attack, and Payment NestJS services. Socket.IO traffic intentionally connects directly to backend gateways because this component currently handles REST traffic only.

## Technology

Go 1.26, `net/http`, and `net/http/httputil`.

## Configuration

```bash
cp .env.example .env
```

Set `PROXY_ADDR` and `PROXY_CONFIG` in `.env`. Update upstream URLs in `config.json` for your deployment network.

## Run from source

```bash
go mod download
go run .
```

The proxy listens on `http://localhost:8080` by default. Build it with:

```bash
go build -trimpath -ldflags="-s -w" -o api-gateway .
```

## Docker

```bash
docker build -t loadservice-api-gateway .
docker run --rm -p 8080:8080 --env-file .env loadservice-api-gateway
```
