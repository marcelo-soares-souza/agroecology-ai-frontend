# Agroecology Map AI — Frontend

Web interface for the Agroecology Map AI platform. RAG-powered chat for agroecological knowledge, document management, and ingestion monitoring.

## Stack

- **React 19.2** + **TypeScript** + **Vite**
- **Tailwind CSS v4** (CSS-first `@theme` config)
- **React Router v7** (`createBrowserRouter`)
- **TanStack Query** (server state + caching)
- **i18next** (pt-BR + en + es + fr)
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

## Structure

```
frontend/src/
├── components/
│   ├── chat/          ChatBox, ChatMessage, SourceCard
│   ├── layout/        AppShell, Sidebar (drawer), Header
│   └── ui/            Button, Card, Input, Badge, Skeleton
├── features/
│   ├── home/          Chat page (Q&A, Markdown rendering)
│   ├── documents/     List, Detail, Edit, Upload (SHA256-based dedup)
│   ├── ingestion/     Trigger + history table
│   ├── status/        Server health dashboard
│   └── about/         Project info
├── hooks/             usePolling, useChat, useLocale
├── services/          api.ts (all endpoints), types.ts
├── lib/               cn.ts (clsx + tailwind-merge), options.ts
├── config/            api.ts (base URL), i18n.ts
└── locales/           pt-BR/ and en/ translation files
```

## Pages

| Route                 | Page                                |
| --------------------- | ----------------------------------- |
| `/`                   | Chat                                |
| `/status`             | Server Status                       |
| `/documents`          | Document List                       |
| `/documents/:id`      | Document Detail                     |
| `/documents/:id/edit` | Edit Metadata                       |
| `/upload`             | Upload (drag-and-drop + file input) |
| `/ingestion`          | Ingestion Control                   |
| `/about`              | About                               |

## License

GPLv3 — Free Software

## Author

Marcelo Soares Souza <marcelo@agroecologymap.org>
