# LoadService Attack Node Service

The Attack Node Service is a Go worker that accepts authorized benchmark jobs from the node router, renders allow-listed commands, manages their process groups, and publishes execution status to RabbitMQ.

Deploy it only on infrastructure you control, and run benchmarks only against systems you own or are explicitly authorized to test.

## Project Map

| Path | Responsibility |
|---|---|
| `main.go` | HTTP API, host metrics, command rendering, process lifecycle, cancellation, and status publishing |
| `command.go` | Loading Layer 4 and Layer 7 command templates from JSON |
| `payload.go` | Worker request contracts |
| `process_group_unix.go` | Linux process-group creation and termination |
| `process_group_windows.go` | Windows process-group creation and termination |
| `commands.json` | Allow-list mapping method names to shell templates |
| `scripts/http2-benchmark` | Layer 7 JavaScript benchmark implementation |
| `scripts/tcp-benchmark` | Layer 4 JavaScript benchmark implementation |

## HTTP API

| Method | Path | Response | Purpose |
|---|---|---|---|
| `GET` | `/health` | `200` JSON | Report active job count and host CPU/memory percentages |
| `POST` | `/attacks` | `202` | Accept a Layer 4 or Layer 7 job and run it asynchronously |
| `POST` | `/attacks/{id}/stop` | `202` | Cancel a running job and its process group |

`/health` reads Linux `/proc/stat` and `/proc/meminfo`. On hosts without those files, CPU and memory are reported as `0`.

## Main Features

- Loads an explicit method-to-command allow-list at startup.
- Uses Go templates and shell quoting for payload parameters.
- Separates Layer 4 and Layer 7 payload fields.
- Tracks active jobs atomically for router capacity checks.
- Runs each command with a deadline and an isolated process group.
- Stops child processes when a job is cancelled.
- Publishes `RUNNING`, `COMPLETED`, `FAILED`, `TIMEOUT`, and `CANCELLED` status events.
- Includes the Redis `slotKey` and selected `serverId` in status payloads so the backend can update capacity and ownership state.

## Prerequisites

- Go `1.26.5` or a compatible newer version.
- RabbitMQ reachable from the worker.
- Node.js `>=24` for the included JavaScript benchmark commands.
- `/bin/sh` and a Linux-like runtime for the checked-in command templates and complete host metrics.
- Explicit authorization for every target.

Install the Layer 7 script dependencies:

```powershell
cd scripts\http2-benchmark
corepack enable
pnpm install --frozen-lockfile
cd ..\..
```

The TCP script uses Node.js built-ins and has no package manifest.

## Configuration

```powershell
Copy-Item .env.example .env
```

| Variable | Purpose |
|---|---|
| `RABBITMQ_URL` | AMQP connection string |
| `RABBITMQ_ATTACK_STATUS_QUEUE` | Durable output queue for `attack.updateStatus` |
| `ATTACK_COMMANDS_FILE` | Path to the JSON method allow-list |
| `ATTACK_SCRIPT_DIR` | Working directory used when starting rendered commands |
| `LISTEN_PORT` | HTTP port bound on `0.0.0.0` |

`LISTEN_PORT` must match `ATTACK_NODE_PORT` in both the node router and the NestJS backend. The checked-in examples use different values, so align them before running an end-to-end test.

## Command Configuration

`commands.json` has two maps:

```json
{
  "layer7": {
    "METHOD_NAME": "command using {{.Target}}, {{.Duration}}, {{.Rate}}, {{.RequestMethod}}, or {{.PostData}}"
  },
  "layer4": {
    "METHOD_NAME": "command using {{.Target}}, {{.Port}}, {{.Duration}}, or {{.PPS}}"
  }
}
```

Method names must match the Attack database. Templates execute through a shell and therefore have the same privileges as this process. Keep the file read-only in production, use a dedicated unprivileged OS account, and review every change.

The checked-in methods are `HTTP_FREE`, `TLS_BYPASS`, `TCP_FREE`, and `TCP_PREMIUM`.

## Run

```powershell
go mod download
go run .
```

Confirm health using the configured port:

```powershell
Invoke-RestMethod http://localhost:7777/health
```

Replace `7777` when `LISTEN_PORT` is different.

## Execution Flow

1. The router posts an event payload to `/attacks`.
2. `layer == "LAYER_4"` selects the Layer 4 payload; all other values currently take the Layer 7 path.
3. The worker looks up the method in `commands.json`, quotes parameters, and renders the template.
4. It creates a deadline of `duration + 5s` for Layer 4 or `duration + 10s` for Layer 7.
5. The command starts in its own process group and publishes `RUNNING`.
6. Completion, error, timeout, or cancellation publishes a terminal `attack.updateStatus` event.

Layer 4 validates port `1..65535`, duration `1..300`, and mock PPS `0..100`. Layer 7 currently relies on upstream DTO and plan validation, so the worker must remain behind a trusted router.

## Build And Checks

```powershell
gofmt -w *.go
go test ./...
go vet ./...
go build -trimpath -ldflags="-s -w" -o attack-node .
```

This directory does not currently include a Dockerfile. Run the built binary with its `.env`, `commands.json`, scripts, Node.js runtime, and installed script dependencies on the worker host.

## Troubleshooting

- Startup cannot read `.env`: create it in the current working directory; it is mandatory.
- Command configuration fails: check `ATTACK_COMMANDS_FILE`, JSON syntax, and the two layer maps.
- RabbitMQ startup fails: verify URL, credentials, virtual host, and network access.
- Router reports the worker offline: align ports, allow inbound worker HTTP traffic, and test `/health` from the router host.
- `unknown method`: synchronize database methods and `commands.json` keys.
- Script cannot start: verify Node.js, dependencies, `ATTACK_SCRIPT_DIR`, file permissions, and shell availability.
- CPU/memory always show zero: the current metric reader expects Linux procfs.
- Cancellation leaves child processes: run on a supported Linux or Windows build and avoid spawning detached processes outside the managed process group.

## Security Notes

- The worker HTTP API has no built-in authentication or TLS. Restrict it with private networking and firewall rules.
- Never expose benchmark worker ports to the public internet.
- Treat `commands.json` as executable code and do not construct templates from user input.
- Apply independent allow-lists, rate limits, monitoring, and audit logging at the surrounding infrastructure layer.
