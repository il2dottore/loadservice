FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags='-s -w' -o /out/api-gateway .

FROM alpine:3.22
RUN adduser -D -H app
WORKDIR /app
COPY --from=build /out/api-gateway /usr/local/bin/api-gateway
COPY config.json .
USER app
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/api-gateway"]
