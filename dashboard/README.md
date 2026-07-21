# LoadService Dashboard

> A responsive operations dashboard for managing users, plans, attack infrastructure, payments, and real-time platform activity.

The dashboard is the administrative control plane for LoadService. It consumes the backend through the Go reverse proxy for REST traffic and connects to service WebSocket gateways for live attack, payment, and support-ticket updates.

## Highlights

- Responsive admin experience with light/dark themes
- Role, permission, user, plan, and feature management
- Network, method, server, attack, payment, and ticket workflows
- Real-time updates through Socket.IO
- Accessible, reusable form and table components

## Technology stack

React 19, TypeScript, Vite, TanStack Router, React Query, React Table, Tailwind CSS, Radix UI, shadcn/ui, Axios, Zustand, React Hook Form, Zod, Socket.IO Client, Vitest, Playwright, ESLint, and Prettier.

## Local setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

The development server runs at `http://localhost:5173`. Configure the API and WebSocket URLs in `.env`:

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_COMMON_SOCKET_URL=http://localhost:3000
VITE_PAYMENT_SOCKET_URL=http://localhost:5000
VITE_ATTACK_SOCKET_URL=http://localhost:4000
```

## Build and quality checks

```bash
pnpm build
pnpm preview
pnpm lint
pnpm format:check
pnpm test
```

The included Dockerfile builds the Vite application and serves the static output with Nginx.

## Related services

- `../backend`: NestJS APIs and domain services
- `../api-gateway`: Go REST routing layer
- `../attack-node-router`: RabbitMQ consumer and attack-node scheduler
- `../attack-node-service`: Go worker running authorized commands
