# Zoniq UI — specification

## 1. Purpose and boundaries

Zoniq UI is a single-page property-management admin UI built from `zoniq_erd.html`. It is a **self-contained front-end prototype**: the ERD is the source of truth for the data model, Pinia is the source of truth for runtime state, and `localStorage` is the source of truth across reloads.

Out of scope: real authentication, authorization enforcement, HTTP APIs, persistence servers, multi-user sync, and real payment processing.

## 2. Architecture

```text
seed.js ──▶ Pinia store ──▶ views ──▶ router
   │            │             │
   │            │             └── shared components (modal, drawer, badge, KPI, chart pieces)
   │            └── $state watcher in App.vue ──▶ localStorage
   └── format utils / theme + toast composable
```

- `src/data/seed.js` — all 17 ERD entities, sample rows, `createSeedState()`.
- `src/stores/app.js` — one store (`app`). State shape mirrors seed data plus `activeOrganizationId`. Getters join entities and scope results to the active organization; actions are the only mutation path.
- `src/App.vue` — shell, deep `$state` watcher (persistence), toast stack, theme application.
- `src/router/index.js` — public routes (`/landing`, `/login`, `/signup`, marked `meta.public`) plus 12 gated app routes under `/dashboard` and beyond. App routes have `titleKey`, `subtitleKey`, `groupKey` metadata resolving through `route.*` / `nav.*` keys in `shell.js`. A `beforeEach` guard redirects signed-out users to `/login` and signed-in users away from the auth pages.
- `src/data/navigation.js` — sidebar groups and icons; must stay in sync with the router.
- `src/styles/main.css` — design tokens (light + `html[data-mode="dark"]`) and shared primitives.
- `src/styles/tailwind.css` — Tailwind v4 **theme + utilities only** (preflight deliberately omitted). Tokens from `main.css` are bridged via `@theme static inline`, and the `dark` variant is remapped to `[data-mode="dark"]` so it follows the app's theme toggle. Existing pages remain on hand-written CSS; utilities are available for new work.
- `src/i18n/` — Vue I18n instance, locale persistence (`zoniq-locale`), and per-locale message fragments under `locales/{en,bn}/`. `shell.js` holds shared navigation, status, common and route-message keys; each view area owns one fragment file per language.
- `src/composables/useUi.js` — theme preference, toast queue, and a counted body-scroll lock used by modals/drawers.
- `src/utils/format.js` — `currency`, `compactCurrency`, `formatDate`, `formatShortDate`, `formatTodayLong`, `relativeDate`, `initials`, `titleCase`, `todayISO`.

## 3. ERD → implementation mapping

| ERD entity | Store state key | Primary UI surface |
| --- | --- | --- |
| ORGANIZATION | `organizations`, `activeOrganizationId` | Topbar switcher, Settings |
| USER | `users` | Users, Tenants, drawers |
| PROPERTY | `properties` | Properties |
| UNIT | `units` | Units, Properties drawer |
| LEASE | `leases` | Leases |
| LEASE_TENANT | `lease_tenants` | Tenants, lease drawers |
| LEASE_RENT_REVISION | `lease_rent_revisions` | Leases drawer (history) |
| RENT_INCREMENT_PROPOSAL | `rent_increment_proposals` | Proposals, Dashboard queue |
| RENT_CHARGE | `rent_charges` | Rent charges |
| PAYMENT | `payments` | Payments, rent charge drawers |
| MAINTENANCE_REQUEST | `maintenance_requests` | Maintenance |
| MAINTENANCE_REQUEST_COMMENT | `maintenance_request_comments` | Maintenance drawer |
| ROLE | `roles` | Roles & permissions, Users |
| PERMISSION | `permissions` | Roles & permissions |
| MODEL_HAS_ROLE | `model_has_role` | Users, Roles membership |
| ROLE_HAS_PERMISSION | `role_has_permission` | Roles permission matrix |
| PERSONAL_ACCESS_TOKEN | `personal_access_tokens` | Settings |

Relationships are expressed with the ERD foreign keys and resolved in getters (`propertyById`, `unitActiveLease`, `primaryTenant`, `leaseTenants`, etc.). All organization-scoped getters funnel through `orgPropertyIds` / `orgUnitIds` / `orgLeaseIds`.

## 4. State contract

- Storage key: **`zoniq-ui-state-v1`** (JSON of the entire Pinia `$state`).
- Theme key: **`zoniq-theme`** (`light` | `dark`); applied to `document.documentElement.dataset.mode`.
- Auth key: **`zoniq-auth`** (`'true'` when signed in for the demo); managed by `src/composables/useAuth.js` and enforced by the router guard.
- `loadState()` validates **every** seed key (including that `activeOrganizationId` matches an existing organization) and merges the stored payload over a fresh `createSeedState()`, so an older or corrupted payload cannot crash the app.
- `resetDemoData()` replaces `$state` with `createSeedState()`; it does not clear the theme.
- Current sample billing period: `2026-11-01`. Dashboard revenue history is illustrative fixed data.

### Mutation actions

`approveProposal`, `rejectProposal`, `recordPayment`, `updateMaintenanceStatus`, `addMaintenanceRequest`, `addComment`, `createProperty`, `createUnit`, `createUser`, `updateUserStatus`, `toggleRolePermission`, `createToken`, `revokeToken`, `setOrganization`, `createWorkspace`, `resetDemoData`.

`createWorkspace(name)` adds an organization on a Starter trial, clones the default system roles and their permissions from organization 1, adds the current user as an Admin member of the new organization, and switches to it. New workspaces start with no properties, units, leases or charges.

Approving a proposal additionally appends a `LEASE_RENT_REVISION`, updates the lease's `monthly_rent`, and adjusts an open `RENT_CHARGE` for that lease.

## 5. UI conventions

- Composition API with `<script setup>` only.
- Every user-facing string goes through `t('key')` from `vue-i18n`; both `en` and `bn` fragments must stay in sync. Seeded data values (names, cities, emails, addresses) are not translated. Shared labels reuse `nav.*`, `status.*`, `common.*`, `topbar.*` and `route.*` from `shell.js`. Escape message-syntax characters such as `@` as `{'@'}` — a raw `@` throws an "Invalid linked format" error at render time.
- Reuse `BaseModal`, `DetailDrawer`, `StatCard` (`compact` for tight KPI strips), `StatusBadge`; reuse shared CSS classes before writing scoped styles.
- Tokens only — no literal colors. In custom CSS use `var(--...)`; in Tailwind use the mapped tokens (`bg-primary`, `text-muted`, `border-border`, `dark:text-ink`). Dark mode is a first-class requirement for every new view. Preflight stays disabled.
- Searchable tables read `route.query.q` and expose a `.search-field`; filters are local `ref`s.
- Data pages use the collapsible advanced-filter pattern from `PaymentsView.vue`: a toolbar **Filters** button with active-count badge, a **Clear** action, and a panel using the shared `.filter-panel` / `.filter-grid` / `.preset-row` / `.filter-count` classes from `main.css`. Filter combinations are ANDed. The active-count check must not call `.trim()` on numeric filter refs — compare against `''` / `null` / `undefined` instead.
- Status labels/tones are centralized in `StatusBadge.vue`.
- User actions produce a `notify()` toast.
- Responsive expectations: sidebar collapses under 1024px; grids collapse under 900–1200px; wide tables scroll in `.table-wrap`.

## 6. Adding a module

1. Add the entity and rows to `src/data/seed.js` (and `createSeedState()`).
2. Add org-scoped getters and mutation actions to `src/stores/app.js`.
3. Add the route with metadata in `src/router/index.js` and the nav entry in `src/data/navigation.js`.
4. Build the view in `src/views/` from shared primitives.
5. Add format helpers if needed; keep `AGENTS.md` conventions.
6. Update this document and the README feature list.
7. Verify `npm run build`, no console errors, light + dark themes, and a narrow viewport.

## 7. Known limitations

- Permissions are display/edit data only; the UI does not enforce them.
- "Invite user" and "create token" simulate creation locally; no emails or real tokens are issued.
- The demo user is always Alex Morgan of the active organization; organization switching only changes displayed data.
- Dates and amounts are static seed values and do not advance with the real clock.
