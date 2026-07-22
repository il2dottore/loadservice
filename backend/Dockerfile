FROM node:24-alpine AS builder
WORKDIR /app

ARG SERVICE
ENV SERVICE=${SERVICE}

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN node dev-scripts/build.js ${SERVICE}

# Resolve TypeScript path aliases in compiled output
RUN pnpm exec tsc-alias

FROM node:24-alpine AS production
WORKDIR /app

ARG SERVICE
ENV SERVICE=${SERVICE}

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

CMD ["sh", "-c", "node dist/apps/${SERVICE}/main.js"]
