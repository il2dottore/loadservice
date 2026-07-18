# LoadService Attack Node Router

> A Go-based RabbitMQ worker that translates attack events into controlled requests to eligible attack nodes.

The router consumes `attack.events` emitted by the NestJS Attack service, dispatches authorized jobs to available nodes, handles cancellation requests, and publishes durable status events to `attack.status.events`.

## Responsibilities

- Consume `attack.fired` and `attack.cancel` messages
- Select eligible nodes while respecting slot capacity
- Forward attack and cancellation commands over HTTP
- Publish execution status events
- Acknowledge handled RabbitMQ messages to prevent duplicate dispatch

## Technology

Go 1.26 and RabbitMQ using `github.com/rabbitmq/amqp091-go`.

## Configuration and local run

```bash
cp .env.example .env
go mod download
go run .
```

Configure `RABBITMQ_URL`, `RABBITMQ_ATTACK_QUEUE`, and `RABBITMQ_ATTACK_STATUS_QUEUE`. The router uses `ATTACK_NODE_PROTOCOL` and `ATTACK_NODE_PORT` to reach workers.

## Docker

```bash
docker build -t loadservice-attack-node-router .
docker run --rm --env-file .env loadservice-attack-node-router
```
