FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags='-s -w' -o /out/reverse-proxy .

FROM alpine:3.22
RUN adduser -D -H app
WORKDIR /app
COPY --from=build /out/reverse-proxy /usr/local/bin/reverse-proxy
COPY config.json .
USER app
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/reverse-proxy"]
