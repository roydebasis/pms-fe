# Live API implementation plan — Zoniq UI

**Status:** plan only · **Created:** 2026-11-28 · **Owner:** frontend
**Target:** implement the API-backed (`live`) mode in `zoniq-ui` against the pinned **v1** contracts.
**Source of truth:** `docs/api/openapi/*.json`, `docs/api/_conventions.md`, `docs/API_INTEGRATION.md`.
Backend feature plans already exist in the sibling repo at `zoniq/docs/features/F-*.md`; this document
covers the UI work and lists the backend prerequisites it depends on.

---

## 0. Current state (analysis)

### Frontend — fully self-contained demo
- `src/stores/app.js`: 18 state keys (17 ERD arrays + `activeOrganizationId`), 28 getters, 16 actions.
  **All actions are synchronous local mutations**; no `fetch`, no async, no DTO mapping.
- `src/api/` **does not exist** (`docs/SPEC.md` marks it *planned*). No `import.meta.env` reads anywhere
  in `src/`; `VITE_API_BASE_URL` is only referenced in docs and `.env.example`.
- `src/composables/useAuth.js`: auth is a **boolean** in `localStorage['zoniq-auth']`; no token, no
  `POST /auth/login`. Router guard (`src/router/index.js`) only checks that boolean.
- `src/App.vue`: deep `$state` watcher persists the **entire** Pinia state to
  `localStorage['zoniq-ui-state-v1']`. In live mode this must stop.
- `src/utils/format.js`: `currency()` / `compactCurrency()` **hardcode `USD`**; API default is `BDT`
  with a per-organization override — a correctness bug once live data is shown.
- `dashboardStats` hardcodes billing period `2026-11-01` and a fixed revenue array; `activityFeed`
  is built entirely from local seed rows.
- 15 views / 17 route entries (12 gated app routes + 3 public + redirect + catch-all), all reading
  store getters. No renter, platform, expenses, reports or audit UI.
- i18n: 16 locale fragments per language under `src/i18n/locales/{en,bn}/`, currently in sync.

### Backend — documented and versioned
- Four Scramble surfaces, all server URLs now derived from `APP_URL`:
  staff `/api/v1`, renter `/api/v1/renter`, platform `/api/v1/platform`, webhooks `/api/v1/webhooks`.
- Pinned specs: staff **64 paths / 102 ops**, renter **30 / 32**, platform **8 / 13**, webhooks **5 / 5**.
- Route files live in `zoniq/routes/v1/`; v2 block in `zoniq/bootstrap/app.php` is intentionally
  commented out and points to `routes/v2/api_v2.php`. **No v2 contract exists** — plan targets v1.
- Auth: staff `auth:sanctum`, renter `auth:tenant`, platform `auth:platform`; tokens must never mix.
- Conventions: success `{status,message,data}`, error `{status:"error",error_code,message,errors}`,
  branch on `error_code`; lists `data` array + `meta`/`links`, `?page=` only, 20 per page; money decimal
  string (BDT default); dates `YYYY-MM-DD`; foreign ids → 404; gateway chosen via `method.gateway`.

### Contract discrepancies to resolve before implementation
| Issue | Detail | Action |
| --- | --- | --- |
| Invitation routes missing from staff spec | `POST /renter-invitations`, `/resend`, `/cancel` exist in `routes/v1/api_v1.php` but not in `staff.json`; renter spec has anomalous `/-invitations` paths. | Verify with `php artisan route:list`, then re-sync specs. Do not code from the anomalous paths. |
| Webhook methods | Spec shows `GET` only for SSLCommerz redirects; routes accept `GET\|POST`. | UI never calls webhooks — informational only. |
| `PUT` vs `PATCH` | Spec shows only `PUT` for several `apiResource` updates; routes accept both. | Use `PUT` from the UI to stay within the pinned contract. |
| No staff dashboard endpoint | Staff spec has no `/dashboard`; renter spec does. | Decide: assemble staff KPIs client-side from list/report endpoints, or add a backend endpoint (backend change). |
| No staff API for workspace creation / PATs | `createWorkspace`, `createToken`, `revokeToken` have no staff endpoint. | Hide or disable those controls in live mode; do not invent endpoints. |

---

## 1. Implementation phases

Progress is tracked with the checkboxes below; update this file as work lands.

### Phase 0 — Contract & config groundwork
- [ ] Re-run `npm run api:sync` against a reachable backend (current pins are from `f6dec10`, backend
      has since moved to `1b0b66c`) and commit refreshed `docs/api/openapi/*.json` + `CONTRACT.md`.
- [ ] Add missing variables to `.env.example`: `VITE_API_MODE=demo`, `OPENAPI_WEBHOOKS_URL` (optional).
- [ ] Resolve the discrepancy table above with the backend owner; re-sync again if specs change.
- [ ] Decide the staff-dashboard approach (client-side aggregation vs new backend endpoint).
- [ ] Confirm backend CORS allows the UI origin (`FRONTEND_URL`) before live E2E testing.

### Phase 1 — HTTP client (`src/api/`)
- [x] `src/api/client.js` — one `fetch` wrapper per surface:
  - accepts `{ baseUrl, token, surface, onUnauthenticated }`;
  - unwraps `{status,message,data}`, throws a typed `ApiError` carrying `error_code`, `message`,
    `errors`, HTTP status; **never logs the token**;
  - sets `Authorization: Bearer <token>` only for staff/renter/platform; no webhook client;
  - JSON only, `AbortSignal.timeout`, small retry only for idempotent GETs (optional).
- [x] `src/api/errors.js` — maps `error_code` to i18n keys (`UNAUTHENTICATED`, `VALIDATION_ERROR`,
      `NOT_FOUND`, `PLAN_EXPIRED`, `TOO_MANY_REQUESTS`, `INVALID_CREDENTIALS`, …). No message-text matching.
- [x] `src/api/index.js` — exports `apiMode` (`import.meta.env.VITE_API_MODE ?? 'demo'`),
      `isLive`, and preconfigured `staffApi` / `renterApi` / `platformApi` from `VITE_API_BASE_URL`.
- [x] `src/api/token.js` — separate storage keys per surface (`zoniq-token-staff`, etc.); token
      never written into the `$state` persistence payload.
- [ ] `src/api/resources/*.js` — one module per resource group built **only** from pinned paths:
      `auth`, `organizations`, `properties`, `units`, `leases`, `tenants`, `rentCharges`, `payments`,
      `proposals`, `maintenance`, `users`, `roles`, `notifications`, `documents`, `expenses`,
      `reports`, `auditEvents`, `paymentMethods`.
- [x] Unit checks for envelope unwrapping and error-code mapping (Vitest + MSW, 25 tests, 100%
      coverage of the covered modules; see `docs/TESTING.md`).

### Phase 2 — Auth & mode switch
- [ ] `src/composables/useApiMode.js` — reactive mode flag; `demo` is the default so existing setups
      keep working.
- [ ] `useAuth.js` — in live mode: `login()` calls `POST /auth/login`, stores the returned token,
      derives `isAuthenticated` from token presence; `logout()` calls `POST /auth/logout` then clears
      all surface tokens. Demo mode keeps the current boolean behavior.
- [ ] Router guard — check the real auth state; on `UNAUTHENTICATED` clear tokens and redirect to
      `/login`. Public pages unchanged.
- [ ] `LoginView.vue` — live submit uses the API client; field/global errors rendered from
      `error_code` i18n keys; demo credentials box shown only in demo mode.
- [ ] `App.vue` watcher — persist `$state` **only in demo mode**; in live mode store no domain data in
      localStorage (theme/locale/token live in their own keys).
- [ ] Add all new auth/error strings to **both** `src/i18n/locales/en/` and `bn/`; keep `@` escaped
      (e.g. `{'@'}`).

### Phase 3 — Store dual-mode actions & read pipeline
- [ ] `src/stores/mappers.js` — normalize API DTOs into the existing store shape so the 15 views keep
      working: notably `lease_renters` → legacy `lease_tenants`, money strings → numbers only at the
      formatting boundary, list payloads → arrays + `meta`/`links`.
- [ ] Add per-resource state: `loading`, `error`, `meta`, `links` (do not change existing array keys).
- [ ] Add `load*` actions (page 1 + pagination metadata) for: dashboard inputs, properties, units,
      leases, tenants, rent charges, payments, proposals, maintenance, users, roles, expenses,
      reports, audit events, notifications, payment methods. Views call them from `onMounted` **only
      in live mode**; demo mode remains instant seed data.
- [ ] Replace hardcoded `dashboardStats` values: demo keeps illustrative values; live aggregates from
      the API (dedicated endpoint if added, otherwise list/report endpoints). `activityFeed` maps from
      real payments / maintenance / audit events.
- [ ] Make money formatting currency-aware: extend `src/utils/format.js` to accept a currency code
      from the active organization (default `BDT`), without changing raw API values.
- [ ] Convert all 16 actions to async dual-mode actions (endpoint parameter names are exactly as pinned):

| Store action | Live endpoint (v1) | Notes |
| --- | --- | --- |
| `setOrganization(id)` | `POST /organizations/{organization}/activate` | Change local id only after success. |
| `approveProposal(id)` | `POST /rent-increment-proposals/{proposal}/approve` | Reload proposal + lease + charges. |
| `rejectProposal(id)` | `POST /rent-increment-proposals/{proposal}/reject` | Reload proposal. |
| `recordPayment(chargeId, amount, method)` | `POST /payments` | Gateway methods: `POST /payments/intent` or `POST /payments/sslcommerz/session`, then poll `GET /payments/sslcommerz/sessions/{paymentSession}`; redirects advisory only. |
| `updateMaintenanceStatus(id, status)` | `PUT /maintenance-requests/{maintenanceRequest}` | Use `PUT` per pinned spec. |
| `addMaintenanceRequest(payload)` | `POST /maintenance-requests` | Reload list. |
| `addComment(id, body)` | `POST /maintenance-requests/{maintenanceRequest}/comment` | Reload comments. |
| `createProperty(payload)` | `POST /properties` | Reload list. |
| `createUnit(payload)` | `POST /properties/{property}/units` | Reload units. |
| `createUser(payload)` | `POST /users` | Reload users. |
| `updateUserStatus(id, status)` | `PUT /users/{targetUser}` | Reload users. |
| `toggleRolePermission(roleId, permId)` | `PUT /roles/{role}` | Send the full permission set the API expects; reload roles. |
| `createWorkspace(name)` | — | No staff endpoint: hide in live mode. |
| `createToken(name)` / `revokeToken(id)` | — | No staff endpoint: hide in live mode (PATs are created backend-side). |
| `resetDemoData()` | — | Demo-only; hide in live mode. |

- [ ] Loading/empty/error states in every view driven by the new `loading` / `error` state; `notify()`
      still fires after successful actions; failures notify with the mapped `error_code` message.
- [ ] Pagination UI where lists exist (`meta.current_page`, `last_page`, `total`; `?page=` only).

### Phase 4 — API-only modules (after core parity)
Each item: route in `src/router/index.js` + nav entry in `src/data/navigation.js` + one SFC in
`src/views/` + `labelKey`/`titleKey`/`subtitleKey` in `shell.js` + en/bn fragments + `SPEC.md` and README
updates + shared components/tokens + light/dark/narrow verification.
- [ ] Expenses (F-24) — list/create/edit + private receipt URL via `GET /expenses/{expense}/receipt/serve`.
- [ ] Reports (F-25) — monthly income, property income, income vs expense, CSV/XLSX export.
- [ ] Audit timeline (F-29) — `GET /audit-events`.
- [ ] Notifications (F-22) — list, mark read, read all.
- [ ] Payment methods & gateway checkout (F-27/F-31) — read `GET /payment-methods`, pick by `gateway`;
      no webhook routes from the UI.
- [ ] Vacant units (F-26) — `GET /units/vacant`.
- [ ] Documents (F-19/F-28) — categories, scoped downloads, signed URLs.
- [ ] Renter portal and platform admin are **separate surfaces with separate tokens** — plan as a
      distinct effort; never reuse a staff token there.

### Phase 5 — Hardening, versioning & release
- [ ] Handle 401/404/422/429 and `PLAN_EXPIRED` globally; no token or invitation token in URLs/logs.
- [ ] Verify no cross-organization data leaks: every read is scoped by the server-resolved active
      organization, not a client-provided id.
- [ ] Light **and** dark themes, narrow viewport, `npm run build`, no console errors in either mode.
- [ ] Document the contract workflow in README and keep `docs/api/CONTRACT.md` hashes current.
- [ ] v2 readiness: add `routes/v2/` + a new Scramble surface + `docs/api/v2/*.json` pins when a real
      v2 contract exists; frontend selects version via `VITE_API_BASE_URL`. Version the **transport**
      (routes/controllers/requests/resources/docs); keep `App\Actions\*` and `App\Modules\*` shared
      unless business rules change, in which case add a version-specific implementation behind the
      existing contract rather than duplicating logic.

---

## 2. Endpoint → UI surface map (pinned v1)

| UI module | Surface | Key pinned paths |
| --- | --- | --- |
| Dashboard | staff | `/properties`, `/units`, `/leases`, `/rent-charges`, `/payments`, `/maintenance-requests`, `/rent-increment-proposals`, `/reports/*` |
| Properties / Units | staff | `/properties`, `/properties/{property}`, `/properties/{property}/units`, `/units/{unit}`, `/units/vacant` |
| Leases / Tenants | staff | `/leases`, `/leases/{lease}`, `/organizations/{organization}/renters`, `/leases/{lease}/occupants`, `/leases/{lease}/guarantors` |
| Rent charges / Payments / Proposals | staff | `/rent-charges`, `/payments`, `/payments/intent`, `/payments/{payment}/refunds`, `/payments/sslcommerz/session`, `/rent-increment-proposals` |
| Users / Roles | staff | `/users`, `/users/{targetUser}`, `/roles`, `/roles/available-permissions` |
| Maintenance | staff (+ renter) | `/maintenance-requests`, `/maintenance-requests/{maintenanceRequest}/comment` |
| Expenses / Reports / Audit | staff | `/expenses`, `/reports/monthly-income`, `/reports/property-income`, `/reports/income-vs-expense`, `/reports/export`, `/audit-events` |
| Notifications / Documents | staff (+ renter) | `/notifications`, `/document-categories`, `/properties/{property}/documents`, `/tenant-documents/{document}/serve` |
| Renter portal | renter | `/dashboard`, `/leases`, `/payments`, `/invitations`, `/maintenance-requests`, `/documents/tenant` |
| Platform admin | platform | `/me`, `/organizations`, `/plans`, `/support-grants` |
| Webhooks | — | **Never called from the UI** (gateway → backend only) |

---

## 3. Testing strategy

Full guide: [`TESTING.md`](TESTING.md). Chosen toolchain (approval required — §5, question 4):

| Layer | Tool |
| --- | --- |
| Unit / store / component | Vitest 5.1 + @vue/test-utils 2.6 + happy-dom 21 |
| HTTP mocking | MSW 3, handlers derived from pinned specs — no live URLs in tests |
| Coverage | @vitest/coverage-v8 5.1 |
| E2E (later) | Playwright 1.65 |

- [x] `P1.0` — toolchain approved and installed; `test`, `test:watch`, `test:coverage` scripts added.
      `test:e2e` is deferred until Playwright work starts.
- [x] Tests shipped with the first slice: client envelope/errors/token isolation and en/bn i18n
      parity (25 tests). Remaining: DTO mappers, both demo/live branches of every store action, and
      one interaction test per changed view.
- [x] Coverage so far: 100% statements/branches/functions/lines for the covered `src/api/*` modules.
      Store ≥80% and per-view tests are still pending; record results here as they land.
- [x] Verification ladder documented and used for `P1.0`/`P1.1`: `npm run test`,
      `npm run test:coverage` and `npm run build` all pass. CI (`.github/workflows/ci.yml`) runs the
      same checks on every push/PR. `/review` at phase end is still pending.

## 4. AI execution workflow

This file is the execution board. Work **one task at a time**, in order, and stop at any
**HUMAN DECISION** gate. Never invent endpoints, fields, enum values, routes, dependencies or
storage keys that the pinned contract and this plan do not cover.

### Per-task protocol
1. Read `AGENTS.md`, `docs/SPEC.md`, `docs/API_INTEGRATION.md`, `docs/api/_conventions.md`, this plan
   and the pinned spec for the surface being changed. Do not fetch a contract from a live URL.
2. Run `git status --short`; never overwrite uncommitted work from another person.
3. Touch only the files named by the task. Follow the non-negotiables: `<script setup>`, mutations
   only through store actions, org-scoped getters, no per-view storage, shared components, design
   tokens, `format.js`, `notify()`, `route.query.q`, all strings in **both** `en` and `bn` with `@`
   escaped, no dead controls.
4. Add/update tests with the code (§3) and run the task's exit verification.
5. Tick the checkbox, add a row to §8 (date, commit SHA, notes), commit as
   `feat(live-api): <task id> <summary>`, then stop for review.
6. At the end of each phase run `/review` (read-only reviewer) and fix all Critical/Major findings
   before starting the next phase.

### Task IDs
| ID | Scope | Exit verification |
| --- | --- | --- |
| `P0.1` | Re-sync pinned contracts; update hashes in `CONTRACT.md` | `npm run api:sync`, hashes match, build |
| `P0.2` | Add `VITE_API_MODE` / `OPENAPI_WEBHOOKS_URL` to `.env.example` | build |
| `P0.3` | **HUMAN DECISION** — resolve §5 gates, record answers in §8 | sign-off recorded |
| `P1.0` | Approve/install test toolchain, add scripts | `npm run test`, build |
| `P1.1`–`P1.4` | API client, error mapping, token storage, resource modules | client tests, build |
| `P2.1`–`P2.4` | Mode composable, real auth, guard/login view, watcher, i18n | auth + component tests, build |
| `P3.1`–`P3.6` | Mappers, list state, `load*` actions, dashboard, currency, mutations, UI states | store/component tests, coverage, build |
| `P4.1`–`P4.7` | One API-only module per task (route + nav + view + i18n + docs) | module tests, `/review`, build |
| `P5.1`–`P5.2` | Hardening, v2 readiness notes | full test suite, E2E, build |

### Ambiguity rule
If the pinned contract does not describe what a task needs, stop and ask — do not guess. Mark the
question in §5 and keep the affected checkbox open.

## 5. Open questions (blocking decisions)
1. Staff dashboard: client-side aggregation or a new backend endpoint?
2. Should live mode hide workspace creation and token management, or should the backend gain those endpoints?
3. Which API base should staging/production use — single `VITE_API_BASE_URL` or per-surface variables?
4. ~~Do we add a test runner for the API client?~~ **Resolved 2026-11-29:** approved — Vitest 5 +
   @vue/test-utils 2 + happy-dom 21 + MSW 3 + coverage-v8 5; Playwright deferred. Installed in `P1.0`.
5. When should the pinned contracts be re-synced relative to the next backend release?

---

## 6. Definition of done
- `VITE_API_MODE=demo` behaves exactly as today; `VITE_API_MODE=live` runs entirely from the API.
- No domain data persisted to localStorage in live mode; no token logged or leaked into URLs.
- All user-facing strings translated in `en` and `bn`; no dead buttons (unsupported live actions hidden).
- `npm run build` passes; both themes and a narrow viewport verified; no console errors.
- This file updated with completion dates and any deviations from the plan.

## 7. Verification record (2026-11-28, rechecked 2026-11-29)
Checked before implementation. No source code was changed — only documentation: this plan plus
pointers added to `README.md`, `docs/SPEC.md`, `docs/API_INTEGRATION.md` and the new `docs/TESTING.md`.
AI-workflow readiness rechecked on 2026-11-29.
- [x] Every existing file referenced by the plan exists.
- [x] Pinned spec hashes and path counts match `docs/api/CONTRACT.md` exactly:
      staff `64 / 40481D6E611F6778`, renter `30 / C4C821E217B14429`,
      platform `8 / 199B6AE6FEEB60F3`, webhooks `5 / D8EB68CBB462BC10`.
- [x] Every concrete endpoint path and method in the mapping tables exists in the pinned specs; parameter names
      were corrected to the pinned names (`{proposal}`, `{paymentSession}`, `{maintenanceRequest}`,
      `{targetUser}`, `{role}`, `{expense}`).
- [x] Store counts verified against source: 18 state keys, 28 getters, 16 actions.
- [x] 15 views, 17 route entries (12 gated app routes), 16 locale fragments in each of `en` and `bn`.
- [x] Error-code names verified against `zoniq/app/Enums/ApiErrorCode.php`.
- [x] Discrepancies confirmed: `POST /renter-invitations{,/{id}/resend,/{id}/cancel}` exist in
      `zoniq/routes/v1/api_v1.php` but not in `staff.json`; `renter.json` contains anomalous
      `/-invitations` paths; no staff `/dashboard`; no PAT or workspace-creation endpoint.
- [x] `.env.example` confirmed missing `VITE_API_MODE` and `OPENAPI_WEBHOOKS_URL`.
- [x] Pins are from backend `f6dec10`; backend HEAD is `1b0b66c` — Phase 0 re-sync is required.
- [x] AI workflow: task IDs, per-task protocol, decision gates, ambiguity rule and progress-log
      protocol are explicit (§4); reviewer agent and `/review` command are wired in the repo.
- [x] Testing: toolchain chosen, versions checked against npm on 2026-11-29, install/scripts/layout/
      rules/coverage/verification ladder documented in `docs/TESTING.md` and §3.
- [x] `npm run build` passes after documentation changes.
- [x] After approval on 2026-11-29, `P1.0`/`P1.1` executed: toolchain installed, 25 tests passing,
      100% coverage of covered modules, `npm run build` passing.

## 8. Progress log
| Phase | Status | Date | Notes |
| --- | --- | --- | --- |
| 0 — Groundwork | Not started | — | Re-sync pins first. |
| 1 — API client | `P1.0`, `P1.1`–`P1.3` done; `P1.4` pending | 2026-11-29 | Toolchain installed; `src/api/{client,errors,index,token}.js`, en/bn error messages and 25 tests added. 100% coverage of covered modules; `npm run build` passes. Uncommitted. |
| 2 — Auth & mode switch | Not started | — | |
| 3 — Store dual-mode | Not started | — | Largest phase. |
| 4 — API-only modules | Not started | — | After core parity. |
| 5 — Hardening | Not started | — | |
