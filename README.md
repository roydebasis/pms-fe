# Zoniq — Property Management UI

A modern, responsive single-page application for property management, built with **Vue 3** and modelled directly after the Zoniq entity-relationship diagram. It is a self-contained front-end demo: all data is seeded locally, mutations are persisted in the browser, and no backend is required.

## Features

- **Dashboard** — portfolio KPIs, a 6-month revenue chart, occupancy by property, recent payments, a rent-approval queue, an activity feed and a maintenance watchlist.
- **Properties** — grid/list views, search and filters, occupancy stats, resident avatars, and a create-property flow.
- **Units** — searchable, sortable inventory table with status/property filters, a detail drawer with maintenance history, and a create-unit flow.
- **Leases** — active agreements with increment modes, next-review dates, rent-revision history and related charges.
- **Tenants** — resident profiles with lease details, outstanding balances, co-tenants and charge history.
- **Rent charges** — invoice ledger with summary metrics and a working **record payment** action.
- **Payments** — payment ledger with receipts, a payment-method breakdown, and advanced filters for resident (name/email/mobile), method, year, month, date range, plus quick ranges.
- **Properties, Units, Leases, Tenants, Rent charges and Rent proposals** — each has a collapsible advanced-filter panel for the most useful domain fields (rent/balance ranges, dates, occupancy, tenant contact details, and more), with an active-filter count and one-click clear.
- **Rent proposals** — status tabs with working **approve / decline** actions; approving updates the lease rent, creates a rent revision, and adjusts the open charge.
- **Maintenance** — kanban board and list views, status transitions, comments and a new-request form.
- **Users** — team members and residents with invite, suspend and activate actions.
- **Roles & permissions** — role cards with a live permission matrix and membership lists.
- **Settings** — workspace details, light/dark appearance, API token management and demo-data reset.

Shared UI touches: collapsible mobile sidebar, global search with `/` keyboard shortcut, notification feed, organization switcher (including **Create workspace**), toasts, detail drawers and modals. A new workspace starts on a Starter trial with cloned system roles and you as its Admin.

The topbar language menu switches between **English** (default) and **বাংলা (Bangla)**. The choice is stored in `localStorage` under `zoniq-locale` and applied to `<html lang>`. UI strings live in `src/i18n/locales/{en,bn}/`; seeded data values (names, addresses, emails) are deliberately left untranslated.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build tool | Vite 6 |
| Routing | Vue Router 4 |
| State | Pinia 2 |
| Internationalization | Vue I18n 11 (English default, Bengali) |
| Icons | `lucide-vue-next` |
| Styling | Hand-written CSS design system + Tailwind CSS v4 utilities (shared tokens, no preflight) |
| Persistence | `localStorage` |

## Quick start

Prerequisites: **Node.js 20+** and npm.

```powershell
cd D:\Projects\HERD\zoniq-ui
npm install
npm run dev
```

Open **http://localhost:5173**.

Other commands:

```powershell
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## Backend API (live mode)

The UI also supports an API-backed mode. Copy `.env.example` to `.env`, set
`VITE_API_BASE_URL` to a shared backend URL (for example an ngrok host), and
see `docs/API_INTEGRATION.md`. OpenAPI contracts are pinned in
`docs/api/openapi/`; run `npm run api:sync` after a backend release and commit
the regenerated files. The app never fetches specs at runtime, so `npm run dev`
and `npm run build` work without the backend running.

## Project structure

```text
zoniq-ui/
├── index.html                  # App shell, fonts, theme bootstrap
├── vite.config.js              # Vite config + "@" → src alias
├── package.json
└── src/
    ├── main.js                 # App bootstrap (Pinia + Router + CSS)
    ├── App.vue                 # Shell layout, persistence watcher, toasts
    ├── router/index.js         # Routes and page metadata
    ├── components/             # AppSidebar, AppTopbar, StatCard,
    │                           # StatusBadge, BaseModal, DetailDrawer
    ├── composables/useUi.js    # Theme + toast notifications
    ├── data/
    │   ├── seed.js             # Sample dataset for all ERD entities
    │   └── navigation.js       # Sidebar navigation groups
    ├── stores/app.js           # Pinia store: getters + mutating actions
    ├── styles/main.css         # Design tokens and shared UI primitives
    ├── utils/format.js         # Currency/date/initials formatting helpers
    └── views/                  # One SFC per page (12 views)
```

## Data model

`src/data/seed.js` contains every entity from the ERD, using the same foreign keys:

`ORGANIZATION`, `USER`, `PROPERTY`, `UNIT`, `LEASE`, `LEASE_TENANT`, `LEASE_RENT_REVISION`, `RENT_INCREMENT_PROPOSAL`, `RENT_CHARGE`, `PAYMENT`, `MAINTENANCE_REQUEST`, `MAINTENANCE_REQUEST_COMMENT`, `ROLE`, `PERMISSION`, `MODEL_HAS_ROLE`, `ROLE_HAS_PERMISSION`, `PERSONAL_ACCESS_TOKEN`.

The Pinia store derives joined views (for example `unitsDetailed`, `leasesDetailed`, `chargesDetailed`, `maintenanceDetailed`) from those relations and scopes them to the currently selected organization. Supported actions include approving/rejecting proposals, recording payments, updating maintenance status, adding comments, creating properties/units/users/requests/tokens, and editing role permissions.

### Persistence

Every state change is saved under the `zoniq-ui-state-v1` localStorage key. Theme preference is stored separately under `zoniq-theme`. To restore the original sample data, use **Settings → Reset demo data** or the **Reset demo data** button at the bottom of the sidebar.

## Landing page & demo sign-in

The app opens on a public landing page with navigation, a partner/client logo wall, customer testimonials, a contact form, and **Free tier / Pro / Max** pricing, plus sign-in/sign-up links. Visiting any dashboard route while signed out redirects to `/login`; submitting either form with non-empty fields signs you in locally and opens `/dashboard`. The contact form is a local demo: submitting valid fields clears the form and shows a confirmation toast, with no data sent anywhere.

- Public routes: `/landing`, `/login`, `/signup` (rendered without the admin shell)
- App routes: `/dashboard` and the existing pages, all gated by `src/composables/useAuth.js`
- Auth state is stored in `localStorage` under `zoniq-auth`; no real authentication is performed
- Plan CTAs link to `/signup?plan=free|pro|max`, and the signup page preselects that plan

## Styling with Tailwind

Tailwind v4 is configured via `@tailwindcss/vite` in `src/styles/tailwind.css`. It imports only the **theme and utilities** layers — preflight is disabled so the existing UI is untouched. The app's tokens are bridged into Tailwind with `@theme static inline`, and the `dark` variant follows the app's `data-mode` attribute.

```vue
<div class="flex items-center gap-3 rounded-card bg-surface p-4 text-ink dark:text-ink">
  <span class="text-primary-text">Uses the same tokens as the custom CSS.</span>
</div>
```

Available token utilities include `bg-*`, `text-*`, and `border-*` for `primary`, `primary-soft`, `primary-text`, `surface`, `surface-2`, `surface-3`, `bg`, `border`, `border-strong`, `ink`, `muted`, `subtle`, `success`, `warning`, `danger`, `info`, and `violet` (plus each `-soft` variant). Existing pages still use the hand-written classes; Tailwind is for new work and incremental refactoring.

## Development guidance

- `AGENTS.md` — conventions and a checklist for AI assistants and future contributors.
- `docs/SPEC.md` — architecture, ERD→entity mapping, state contract and steps to add a module.
- `.opencode/agents/reviewer.md` — read-only reviewer agent that checks changes against those rules. Run it with **`/review`** (defined in `.opencode/commands/review.md`), or ask: *"Use the reviewer subagent to review my current changes."*
- `opencode.jsonc` — loads `docs/SPEC.md` as project instructions and ignores generated folders in the file watcher.

## Notes and limitations

- This is a UI prototype — there is no API, authentication or real authorization layer; role permissions are demonstration data.
- Monetary amounts and dates are sample values; the current billing period is November 2026.
- Tables with many columns scroll horizontally on narrow screens; the layout is responsive from mobile upward.
- The source ERD lives at `D:\Projects\HERD\zoniq\zoniq_erd.html`.
