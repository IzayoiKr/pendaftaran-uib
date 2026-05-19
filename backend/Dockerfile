FROM golang:1.25-alpine AS base
WORKDIR /app
RUN apk add --no-cache ca-certificates mysql-client curl bash
RUN adduser -D admin

FROM base AS dependency
COPY go.mod go.sum ./
RUN go mod download
RUN go install -tags 'mysql' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

FROM dependency AS development
RUN go install github.com/air-verse/air@latest
COPY --chown=admin:admin . .
USER admin
CMD ["air", "-c", ".air.toml"]

FROM dependency AS builder
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/server/main.go

FROM alpine:latest AS production
RUN apk add --no-cache ca-certificates mysql-client curl bash
WORKDIR /app
RUN adduser -D admin && chown -R admin:admin /app
USER admin
COPY --from=builder --chown=admin:admin /server .
COPY --from=builder --chown=admin:admin /app/migrations ./migrations
COPY --from=builder --chown=admin:admin /go/bin/migrate /usr/local/bin/migrate
CMD ["./server"]
