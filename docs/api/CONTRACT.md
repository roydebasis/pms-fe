# Frontend API contract

Pinned OpenAPI documents used by this UI. The initial snapshot was copied from
`pms-be@f6dec10`; `npm run api:sync` refreshes them from the live URLs in
`.env` and rewrites this file.

AI assistants should read these local files plus [`_conventions.md`](_conventions.md)
and [`../API_INTEGRATION.md`](../API_INTEGRATION.md) — never a network URL.

- Backend commit: `f6dec10`
- Initial snapshot date: 2026-11-28

| File | Paths | SHA-256 (first 16) | Source |
|------|-------|--------------------|--------|
| `staff.json` | 64 | `40481D6E611F6778` | `OPENAPI_STAFF_URL` |
| `renter.json` | 30 | `C4C821E217B14429` | `OPENAPI_RENTER_URL` |
| `platform.json` | 8 | `199B6AE6FEEB60F3` | `OPENAPI_PLATFORM_URL` |
| `webhooks.json` | 5 | `D8EB68CBB462BC10` | pinned snapshot; `OPENAPI_WEBHOOKS_URL` (optional) |

## Refresh procedure

1. Point `.env` at the shared backend (ngrok or staging host).
2. Run `npm run api:sync`.
3. Commit `docs/api/openapi/*.json` and this file.
4. Update the backend commit recorded above.

The app itself only needs `VITE_API_BASE_URL`; it never reads these specs at
runtime, so developers can build and run the UI without the backend running.
