# Base Eleitoral 360

Sistema web responsivo para monitoramento territorial de campanha eleitoral, com dashboard, lideranças, apoiadores, prospecção, mapas, zonas eleitorais e inteligência estratégica.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/base-eleitoral run dev` — run the frontend (port 25022)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + TailwindCSS + shadcn/ui + Recharts + Framer Motion + Wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- DB schema: `lib/db/src/schema/` — one file per entity (liderancas, apoiadores, prospectos, zonas, agenda, demandas)
- API contract: `lib/api-spec/openapi.yaml`
- Generated hooks: `lib/api-client-react/src/generated/`
- Generated Zod: `lib/api-zod/src/generated/`
- API routes: `artifacts/api-server/src/routes/` — dashboard, liderancas, apoiadores, prospeccao, zonas, agenda, demandas, mapas
- Frontend pages: `artifacts/base-eleitoral/src/`

## Architecture decisions

- OpenAPI-first: all API contracts defined in `lib/api-spec/openapi.yaml` and generated from there
- Mapa RJ and Mapa Maricá are served as static mock data from the API (structure ready for Mapbox integration)
- Comparativo Eleitoral data is served statically from the API (ready for DB connection)
- Dashboard stats are computed from the DB at request time
- Prospecção pipeline uses a single `prospectos` table with an `etapa` column; the API groups them by stage

## Product

- Dashboard Geral: 10 KPI cards + weekly evolution chart + rankings + declarados vs validados comparison
- Mapa de Força: Interactive org-chart flowchart of the campaign hierarchy with clickable cards
- Lideranças: Full CRUD table + form for all 26 leadership fields
- Apoiadores / Pessoas: Full CRUD with tipo de pessoa, status político, etc.
- Prospecção: Kanban-style 6-stage pipeline funnel
- Mapa RJ: Municipality cards with coverage indicators (Mapbox-ready)
- Mapa Maricá: 21 neighborhood cards with progress bars and priority badges
- Zonas Eleitorais: CRUD for electoral zones and sections
- Comparativo Eleitoral: Sortable table + horizontal bar chart
- Agenda de Campo: Field event management (reuniões, caminhadas, visitas, eventos)
- Demandas: Population demand tracking with priority and status
- Relatórios: 9 report type cards with export buttons (UI-only)
- Configurações: Static campaign settings form

## Gotchas

- Mapas (RJ e Maricá) use hardcoded mock data in `artifacts/api-server/src/routes/mapas.ts` — connect to DB when Mapbox is integrated
- After any OpenAPI spec change, always run `pnpm --filter @workspace/api-spec run codegen` before using updated types
- Never use `console.log` in server code — use `req.log` in route handlers and `logger` elsewhere

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
