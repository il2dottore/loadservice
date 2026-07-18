FROM node:22-alpine AS builder
WORKDIR /app

ARG SERVICE
ENV SERVICE=${SERVICE}

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN npx nest build

# Resolve TypeScript path aliases (@databases/*, @modules/*) in compiled output
RUN pnpm add -D tsc-alias && npx tsc-alias

FROM node:22-alpine AS production
WORKDIR /app

ARG SERVICE
ENV SERVICE=${SERVICE}

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

CMD ["sh", "-c", "node dist/apps/${SERVICE}/main.js"]
