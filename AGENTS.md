# Project instructions for AI assistants

Applies to all work in `D:\Projects\HERD\zoniq-ui`. Read `README.md` for setup and `docs/SPEC.md` for architecture before making changes.

## Scope

This is a **front-end demo** of a property management system. There is no API, no authentication, and no database. Do not introduce backend calls, SDKs, or build-time services. All data lives in the browser.

## Non-negotiable conventions

1. **Data is canonical in `src/data/seed.js`.** Entities mirror the ERD and use the same foreign keys. Add fields/entities there, never in view-local fixtures.
2. **State changes belong in the Pinia store** (`src/stores/app.js`). Views call store actions; they never mutate store arrays/objects directly. Add a getter for every derived/joined view.
3. **All views are query-scoped to `activeOrganizationId`.** Use the existing `org*` getters when adding data to a page.
4. **Persistence is handled centrally** by the `$state` watcher in `src/App.vue` (`zoniq-ui-state-v1`). Do not add per-view storage logic.
5. **One SFC per route** in `src/views/`, registered in `src/router/index.js` with `titleKey`, `subtitleKey` and `groupKey` metadata resolving to `route.*` / `nav.*` keys in `shell.js`. Add matching `labelKey` entries to `src/data/navigation.js` and update `docs/SPEC.md`.
6. **Reuse shared components**: `BaseModal`, `DetailDrawer`, `StatCard`, `StatusBadge`. Do not rebuild modals, drawers, badges or KPI cards inline — use `<StatCard compact>` for tight KPI strips.
7. **Use the design tokens in both styling systems.** Hand-written CSS uses `var(--...)` from `src/styles/main.css`; Tailwind v4 utilities use the bridged tokens from `src/styles/tailwind.css` (`bg-primary`, `text-muted`, `border-border`, `dark:text-ink`, etc.). Never hardcode colors or use arbitrary hex values. Prefer the existing shared classes (`card`, `btn`, `badge`, `table`, `toolbar`, `progress`, `field`) and shared components for consistent screens; reach for Tailwind utilities for layout/spacing and new code, with page-specific CSS in a scoped `<style>` block. Tailwind preflight is disabled — do not enable it, since it would reset the existing UI.
8. **Use the Composition API with `<script setup>`.** No Options API components.
9. **Use `src/utils/format.js`** for currency, dates, initials and title case. Do not duplicate Intl formatting.
10. **Give feedback with `notify()`** from `src/composables/useUi.js` after user actions.
11. **Search state comes from `route.query.q`** so global search can deep-link into a page. Keep that contract when adding tables.
12. **No placeholder or dead controls.** Every visible button should perform a real local action or navigate somewhere meaningful.
13. **All UI text is translated.** Use `t('key')` from `vue-i18n` for every user-facing string and add the matching key to **both** `src/i18n/locales/en/` and `src/i18n/locales/bn/` fragments. Reuse the shared `nav.*`, `status.*`, `common.*`, `topbar.*` and `route.*` keys in `shell.js`. Never translate seeded data values (names, addresses, emails, IDs). Escape vue-i18n special characters in messages — for example write `@` as `{'@'}`; a raw `@` is parsed as a linked message and throws "Invalid linked format", which breaks the whole component.
14. **Advanced filters use the shared pattern.** Toolbar **Filters** button + active-count badge + **Clear**, with `.filter-panel` / `.filter-grid` / `.preset-row` / `.filter-count` from `main.css`. When counting active filters, never call `.trim()` on numeric refs — compare against `''` / `null` / `undefined` instead.
15. **Public pages vs app pages.** `/landing`, `/login` and `/signup` are `meta.public` and render without the admin shell; everything else requires the demo auth flag from `useAuth.js` and goes through the router guard. New app routes point to `/dashboard`-based paths, and their nav entries must use the same path.

## Adding a new module (checklist)

- [ ] Entity + sample rows in `src/data/seed.js` and `createSeedState()`
- [ ] Getters/actions in `src/stores/app.js`, scoped to the active organization
- [ ] Route in `src/router/index.js` + nav item in `src/data/navigation.js`
- [ ] View in `src/views/` using shared components and existing CSS primitives
- [ ] Formatting helpers in `src/utils/format.js` if needed
- [ ] Update `docs/SPEC.md` (module table + ERD mapping) and `README.md` feature list
- [ ] Verify light **and** dark themes, a narrow viewport, and `npm run build`

## Verification

Always finish with:

```powershell
npm run build
```

Then check the running app in the browser for console errors and exercise any new interaction. Demo data can be restored from Settings → Reset demo data.

## Review expectations

A review should reject changes that: bypass store actions, hardcode colors, break dark mode, add unused dependencies, leave dead buttons, desync router/navigation, or change the localStorage contract without updating `docs/SPEC.md`.
