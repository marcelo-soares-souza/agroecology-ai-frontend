# Agroecology Map AI — Frontend

Web client for the Agroecology Map AI platform. It includes the public landing
pages, authenticated RAG chat, document browsing, document suggestions,
community profiles, admin tooling, and ingestion/status dashboards.

## Stack

- **React 19.2.7** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS v4** (CSS-first `@theme` config)
- **React Router v7** (`createBrowserRouter`, lazy route modules)
- **TanStack Query** (server state + caching)
- **i18next** + browser language detection (pt-BR + en + es + fr)
- **react-markdown** + **remark-gfm** (formatted AI responses)

## Quick Start

```bash
cd frontend
bun install
bun run dev        # http://localhost:5173
```

By default, frontend requests use the same origin that served the app. This is
the correct setup for reverse proxy deployments such as `ai.agroecologymap.org`.

For local development without a reverse proxy, either use the Vite `/api` proxy
(default target: `http://localhost:8000`) or override the API base URL:

```bash
VITE_API_BASE_URL=http://localhost:8000 bun run dev
```

If you need to point the Vite dev proxy at a different backend origin:

```bash
VITE_DEV_API_PROXY_TARGET=http://localhost:8000 bun run dev
```

If the frontend is served behind a reverse proxy under a subpath, set the Vite
base path at build/runtime config time:

```bash
VITE_BASE_PATH=/ai/ bun run build
```

## Quality Gates

```bash
bash ../scripts/check-frontend.sh
```

Runs: install, audit, outdated, format, lint, typecheck, test, build, bundle secrets scan.

Useful individual commands:

```bash
bun run format
bun run lint
bun run typecheck
bun run build              # also regenerates public/sitemap.xml
bun run scan:bundle-secrets
```

## Structure

```
frontend/src/
├── components/
│   ├── chat/          ChatBox, ChatMessage, SourceCard
│   ├── layout/        AppShell, Sidebar, Header
│   └── ui/            Button, Card, Input, Badge, Skeleton, InfoTooltip
├── features/
│   ├── admin/         User and suggestion moderation
│   ├── auth/          Login, register, email confirmation, password reset
│   ├── community/     Public user/community profiles
│   ├── documents/     List, detail, edit, upload, inline PDF viewing
│   ├── donate/        Donation page
│   ├── home/          Landing page and authenticated chat page
│   ├── ingestion/     Trigger + history table
│   ├── mobile/        Mobile app page
│   ├── status/        Server health dashboard
│   ├── suggestions/   User document suggestions
│   └── about/         About, privacy policy, terms
├── hooks/             use-app-mutation, use-auth, use-chat, use-locale
├── services/          api.ts (all endpoints), types.ts
├── lib/               cn.ts (clsx + tailwind-merge), options.ts
├── config/            api.ts (base URL), i18n.ts
└── locales/           pt-BR/, en/, es/, and fr/ translation files
```

## Pages

| Route | Page |
| ----- | ---- |
| `/` | Public landing page |
| `/chat` | Authenticated chat |
| `/login`, `/register` | Authentication |
| `/confirm-email`, `/resend-confirmation` | Email confirmation |
| `/forgot-password`, `/reset-password` | Password recovery |
| `/confirm-delete-account` | Account deletion confirmation |
| `/profile/:slug`, `/profile/edit` | Public profile and profile editor |
| `/community`, `/community/:slug` | Community directory and member profile |
| `/documents`, `/documents/:id` | Public document browser |
| `/documents/:id/edit`, `/upload` | Admin document metadata and upload |
| `/suggestions`, `/suggestions/new` | Authenticated document suggestions |
| `/suggestions/:id`, `/suggestions/:id/edit` | Suggestion detail and edit |
| `/admin/users` | Admin user management |
| `/admin/suggestions`, `/admin/suggestions/:id` | Admin suggestion moderation |
| `/status` | Authenticated server status |
| `/ingestion` | Admin ingestion control |
| `/about`, `/privacy`, `/terms` | Static project/legal pages |
| `/donate`, `/mobile` | Donation and mobile app pages |

Protected routes use `AuthGuard`; admin-only routes additionally require the
`admin` role returned by the backend.

## License

GPLv3 — Free Software

## Author

Marcelo Soares Souza <marcelo@agroecologymap.org>
