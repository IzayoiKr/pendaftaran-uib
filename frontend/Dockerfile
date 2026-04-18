FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

FROM base AS development
RUN --mount=type=cache,target=/home/node/.npm npm install --legacy-peer-deps
COPY --chown=node:node . .
USER node
EXPOSE 8989
CMD [ "npm", "run", "dev", "--", "-H", "0.0.0.0" ]

FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
RUN --mount=type=cache,target=/home/node/.npm npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 8989
ENV PORT=8989
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
