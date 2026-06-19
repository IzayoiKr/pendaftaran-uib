# Frontend

Next.js application for Pendaftaran UIB. It provides the localized public site, authentication flows, account pages, registration forms, uploaded document flows, LoA rendering, and registration information pages.

## Stack

- Next.js 16 with App Router
- React 19 with React Compiler enabled
- TypeScript 6
- SCSS modules
- next-intl for `id` and `en` routes
- TanStack Query
- Axios
- Zustand
- React Hook Form and Zod
- Cloudflare Turnstile
- pnpm 11

## Project Layout

```text
src/app/          # App Router routes, metadata, search API route handlers
src/pages/        # Feature page components
src/components/   # Shared UI components
src/providers/    # Client providers for query, session, scroll spy
src/hooks/        # Shared hooks
src/store/        # Zustand stores
src/validation/   # Zod schemas
src/constants/    # Static information and option data
src/messages/     # next-intl message catalogs
src/i18n/         # locale routing and request config
src/lib/          # LoA template helpers
src/assets/       # Imported image assets
src/styles/       # Global SCSS and shared style config
public/           # Static files served by Next.js
```

## Environment

Copy the example file:

```bash
cp example.env.local .env.local
```

Variables:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Runtime mode, normally `development` locally |
| `BACKEND_URL` | Backend API URL used by Next.js rewrites and server-side code |
| `NEXT_PUBLIC_BASE_URL` | Public frontend base URL |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public Cloudflare Turnstile site key |
| `EXTRA_DEV_ORIGINS` | Optional extra origin allowed by Next.js during development |

Typical local values:

```dotenv
NODE_ENV=development
BACKEND_URL=http://localhost:9999
NEXT_PUBLIC_BASE_URL=http://localhost:8989
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key-here
```

In Docker Compose, `BACKEND_URL` is usually `http://backend:9999` because the frontend container talks to the backend service over the Compose network.

## Development

Enable Corepack if pnpm is not already available:

```bash
corepack enable
```

Install dependencies:

```bash
pnpm install
```

Start the dev server:

```bash
pnpm dev
```

Open http://localhost:8989.

## Commands

```bash
pnpm dev            # Start local development server on port 8989
pnpm lint           # Run ESLint
pnpm typecheck      # Run TypeScript without emitting files
pnpm tsec-security  # Run tsec checks
pnpm format         # Format JS, TS, JSX, TSX, SCSS, and CSS files
pnpm build          # Build production app
pnpm start          # Start production server on port 8989
```

## Routing Notes

- Localized pages live under `src/app/[locale]`.
- Locale configuration is defined in `src/i18n`.
- `/api/:path*` is rewritten to `BACKEND_URL` in `next.config.ts`.
- `/search/school` and `/search/university` are Next.js route handlers.
- Security headers and CSP are set in `src/proxy.ts`.

## Docker

The root Compose stack builds the `development` target from `frontend/Dockerfile`, mounts the source tree, and runs:

```bash
pnpm dev -H 0.0.0.0
```

For the complete stack, use the root [README.md](../README.md).
