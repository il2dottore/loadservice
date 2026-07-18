# LoadService Attack Node Service

> A lightweight Go worker that executes authorized load-testing commands on a registered node.

The service exposes a small HTTP control API for health checks, attack start, and cancellation. It loads command definitions from `commands.json`, tracks active processes and resource usage, and publishes execution status through RabbitMQ.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Report active jobs, CPU usage, and memory usage |
| `POST` | `/attacks` | Start an authorized attack job |
| `POST` | `/attacks/{id}/stop` | Stop a running job |

The default listen address is `0.0.0.0:2005`.

## Technology

Go 1.26, standard-library HTTP/process management, and RabbitMQ via `github.com/rabbitmq/amqp091-go`.

## Configuration and local run

```bash
cp .env.example .env
go mod download
go run .
```

Configure `HTTP_ADDR`, `RABBITMQ_URL`, `RABBITMQ_ATTACK_STATUS_QUEUE`, `ATTACK_COMMANDS_FILE`, and `ATTACK_SCRIPT_DIR`. The service expects a Linux-like environment for host CPU and memory metrics.

Build a production binary with:

```bash
go build -trimpath -ldflags="-s -w" -o attack-node .
```

## Safety

Deploy this worker only on infrastructure you own or are explicitly authorized to test. Protect port `2005`, keep RabbitMQ credentials private, and review every command definition before enabling it.
