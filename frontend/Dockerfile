FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

ARG VITE_TURNSTILE_SITE_KEY
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY

FROM base AS development
RUN --mount=type=cache,target=/home/node/.npm npm install --legacy-peer-deps
COPY --chown=node:node . .
USER node
EXPOSE 8989
CMD [ "npm", "run", "dev", "--", "--host" ]

FROM base AS builder
RUN --mount=type=cache,target=/home/node/.npm npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod -R 755 /usr/share/nginx/html
EXPOSE 8989
CMD [ "nginx", "-g", "daemon off;" ]
