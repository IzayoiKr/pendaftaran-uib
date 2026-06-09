# Frontend

Next.js frontend for the Pendaftaran UIB application. It provides the public registration pages, authentication pages, account/profile pages, password reset flow, email verification flow, and registration-related information pages.

## Stack

- Next.js 16
- React 19
- TypeScript
- SCSS modules
- Axios
- Zustand
- Zod
- Cloudflare Turnstile

## Project Layout

```text
src/app/          # Next.js app routes
src/pages/        # Feature page components
src/components/   # Shared UI components
src/hooks/        # Shared hooks
src/store/        # Zustand stores
src/validation/   # Zod schemas
src/constants/    # Static app data and config
src/assets/       # Image assets imported by the app
public/           # Static files served by Next.js
```

## Environment

Copy the example file:

```bash
cp .env.local.example .env.local
```

Variables:

| Variable | Purpose |
| --- | --- |
| `BACKEND_URL` | Backend API URL used by Next.js route handlers/proxy code |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public Cloudflare Turnstile site key |
| `EXTRA_DEV_ORIGINS` | Optional extra development origin |

For local development, `BACKEND_URL` is usually:

```dotenv
BACKEND_URL=http://localhost:9999
```

## Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open http://localhost:8989.

## Commands

```bash
npm run dev        # Start local development server on port 8989
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript without emitting files
npm run build      # Build production app
npm run start      # Start production server on port 8989
```

## Notes

The root [README.md](../README.md) contains full-stack setup instructions, Docker Compose usage, database setup, and backend endpoint references.
