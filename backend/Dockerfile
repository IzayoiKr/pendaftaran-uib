FROM golang:1.25-alpine AS base
RUN apk --no-cache add ca-certificates postgresql-client curl bash
WORKDIR /app
RUN adduser -D admin

FROM base AS dependency
COPY go.mod go.sum ./
RUN go mod download
RUN go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

FROM dependency AS development
RUN go install github.com/air-verse/air@latest
USER admin
COPY --chown=admin:admin . .
RUN chmod +x entrypoint.sh
ENTRYPOINT ["bash", "entrypoint.sh"]
CMD ["air", "-c", ".air.toml"]

FROM dependency AS builder
COPY . .
RUN go build -o server ./cmd/server

FROM alpine:latest AS production
RUN apk --no-cache add ca-certificates postgresql-client curl bash
WORKDIR /app
RUN adduser -D admin && chown -R admin:admin /app
USER admin
COPY --from=builder --chown=admin:admin /app/server .
COPY --from=builder --chown=admin:admin /app/migrations ./migrations
COPY --from=builder --chown=admin:admin /go/bin/migrate /usr/local/bin/migrate
COPY --from=builder --chown=admin:admin /app/entrypoint.sh .
RUN chmod +x entrypoint.sh
ENTRYPOINT ["bash", "entrypoint.sh"]
CMD ["./server"]

