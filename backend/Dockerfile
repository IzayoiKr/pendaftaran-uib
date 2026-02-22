FROM golang:1.25-alpine AS base
RUN apk --no-cache add ca-certificates postgresql-client curl bash
WORKDIR /app
RUN adduser -D appuser && chown -R appuser /app
USER appuser

FROM base AS dependency
COPY go.mod go.sum ./
RUN go mod download
RUN go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

FROM dependency AS development
RUN go install github.com/air-verse/air@latest
COPY . .
COPY --chmod=755 entrypoint.sh .
ENTRYPOINT ["bash", "/app/entrypoint.sh"]
CMD ["air", "-c", ".air.toml"]

FROM dependency AS builder
COPY . .
RUN go build -o server ./cmd/server

FROM alpine:latest AS production
RUN apk --no-cache add ca-certificates postgresql-client curl bash
WORKDIR /app
RUN adduser -D appuser && chown -R appuser /app
USER appuser
COPY --from=builder /app/server .
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /go/bin/migrate /usr/local/bin/migrate
COPY --from=builder /app/entrypoint.sh .
RUN chmod +x entrypoint.sh
ENTRYPOINT ["bash", "/app/entrypoint.sh"]
CMD ["./server"]

