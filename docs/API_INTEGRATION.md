# API integration guide

## Configuration

Copy `.env.example` to `.env` and set:

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Runtime API base, e.g. `https://<ngrok-host>/api/v1` (no trailing slash). |
| `OPENAPI_STAFF_URL` | Live staff spec for `npm run api:sync`. |
| `OPENAPI_RENTER_URL` | Live renter spec for `npm run api:sync`. |
| `OPENAPI_PLATFORM_URL` | Live platform spec for `npm run api:sync`. |
| `BACKEND_COMMIT` | Backend commit recorded in `docs/api/CONTRACT.md`. |

The backend must allow the UI origin through CORS (`FRONTEND_URL` in the
backend). Bearer tokens are used, so cross-origin cookies are not required.

## Runtime rules

- Base URLs: staff = `VITE_API_BASE_URL`, renter = `${base}/renter`,
  platform = `${base}/platform`. Never mix guards/tokens between surfaces.
- Store a Sanctum token after `POST /auth/login` and send it as
  `Authorization: Bearer <token>`. Never log it.
- Success envelope: `{status, message, data}`. Error envelope:
  `{status: "error", error_code, message, errors}`. Branch on `error_code`,
  never on message text.
- Lists return `data` as an array plus `meta` and `links`; only `?page=` is
  supported and the page size is fixed at 20.
- Money is a decimal string (default `BDT`). Dates are `YYYY-MM-DD`; use
  `src/utils/format.js` for display.
- Foreign or unauthorized ids return `404`. Do not reveal existence.
- Payment method catalogue includes `gateway`; the frontend picks the gateway
  by posting the matching `method` (`card` → Stripe, `sslcommerz`/`bkash`/
  `nagad`/`bank_transfer` → SSLCommerz).

## State strategy

Keep the existing Pinia store shape, but introduce a single `src/api/` client:

- `demo` mode (`VITE_API_MODE=demo`): current `seed.js` + localStorage behavior.
- `live` mode (`VITE_API_MODE=live`): store actions call the API client and
  replace local state with API DTOs; localStorage keeps only token/theme/locale.

Views should keep calling store actions, so the migration is incremental.

## Module → surface map

| UI module | Surface |
|-----------|---------|
| Dashboard, Properties, Units, Leases, Tenants, Charges, Payments | staff |
| Users, Roles & permissions, Expenses, Reports, Audit timeline | staff |
| Notifications, documents, maintenance, invitations | staff and renter (separate tokens) |
| Renter portal screens | renter |
| Platform admin screens (if added) | platform |

The UI does not call webhook routes.

## Contract workflow

1. Backend releases a contract change.
2. Run `npm run api:sync` against the shared backend URL.
3. Commit regenerated `docs/api/openapi/*.json` and `docs/api/CONTRACT.md`.
4. AI assistants implement from the pinned files, not from a live URL.

If the backend is unreachable, `npm run api:sync` fails but `npm run build`
and local development still work from the pinned files.
