FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags='-s -w' -o /out/attack-node-router .

FROM alpine:3.22
RUN adduser -D -H app
COPY --from=build /out/attack-node-router /usr/local/bin/attack-node-router
USER app
ENTRYPOINT ["/usr/local/bin/attack-node-router"]
