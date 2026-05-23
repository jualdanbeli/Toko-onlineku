# jualdanbeli Marketplace

Indonesia's premier online marketplace with escrow payments (rekening bersama), fraud detection, multi-courier shipping, and a full admin panel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm --filter @workspace/jualdanbeli run dev` — run the web frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (port 8080, path prefix /api)
- Frontend: React + Vite + Tailwind CSS + shadcn/ui
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/api-server/src/routes/` — all Express route handlers
- `artifacts/api-server/src/lib/auth.ts` — auth middleware (SHA256 + base64url tokens)
- `artifacts/jualdanbeli/src/pages/` — all React pages
- `artifacts/jualdanbeli/src/components/` — shared UI components
- `lib/db/src/schema/` — Drizzle ORM table definitions (source of truth for DB)
- `lib/api-spec/` — OpenAPI YAML spec (source of truth for API contract)
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks (do NOT edit)

## Architecture decisions

- **Escrow system**: Payments held in `transactions` table with `pending` status; released to seller wallet only after buyer confirms receipt
- **Token auth**: SHA256 hash of password + salt, token is base64url(userId:timestamp:random) — simple and stateless
- **Fraud/spam detection**: Products flagged via admin moderation; user bans enforced at middleware level
- **Shipping**: Courier integrations are simulated with realistic cost calculations; tracking numbers mocked
- **Roles**: buyer, seller, admin — enforced at route level via `requireAuth` / `requireAdmin` middleware

## Product

- Browse and search products by category, price, condition
- Sellers can list products with images and manage their shop
- Secure checkout with escrow payment protection (Rekening Bersama)
- Multi-courier shipping with rate calculation and tracking
- Real-time order status updates and notifications
- Admin panel for user management, dispute resolution, withdrawal approval
- Wallet system with withdrawal to bank account

## Demo Accounts

| Role  | Email                      | Password    |
|-------|----------------------------|-------------|
| Admin | admin@jualdanbeli.com      | Admin123!   |
| Seller| seller1@jualdanbeli.com    | Seller123!  |
| Seller| seller2@jualdanbeli.com    | Seller123!  |
| Buyer | buyer@jualdanbeli.com      | Buyer123!   |

## User preferences

- Indonesian marketplace context (IDR pricing, Indonesian product names)
- Keep all route files separate per domain
- Never use console.log in server code, use req.log or logger

## Gotchas

- Express 5: wildcard routes use `/{*splat}`, req.params.id may be string|string[]
- DB schema push must be run after any schema changes: `pnpm --filter @workspace/db run push`
- The `reports` table is defined in `lib/db/src/schema/notifications.ts` (not a separate file)
- Token-based auth: tokens stored in localStorage as "token", sent as `Authorization: Bearer <token>`
- `db.$count()` should NOT be used for updates — use explicit SQL expressions instead

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
