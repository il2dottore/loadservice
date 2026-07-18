FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG VITE_API_URL=http://localhost:8080/api/v1
ARG VITE_COMMON_SOCKET_URL=http://localhost:3000
ARG VITE_PAYMENT_SOCKET_URL=http://localhost:5000
ARG VITE_ATTACK_SOCKET_URL=http://localhost:4000
ENV VITE_API_URL=$VITE_API_URL VITE_COMMON_SOCKET_URL=$VITE_COMMON_SOCKET_URL VITE_PAYMENT_SOCKET_URL=$VITE_PAYMENT_SOCKET_URL VITE_ATTACK_SOCKET_URL=$VITE_ATTACK_SOCKET_URL
RUN pnpm build

FROM nginx:1.29-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
