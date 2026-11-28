# Testing guide — Zoniq UI

**Status:** toolchain approved and installed on 2026-11-29 (Phase 1 task `P1.0` in
[`LIVE_API_IMPLEMENTATION_PLAN.md`](LIVE_API_IMPLEMENTATION_PLAN.md)). Only the first API-client slice
has tests so far; store and view tests arrive with their tasks.

## Recommended toolchain

| Layer | Tool | Why |
| --- | --- | --- |
| Unit / store / component | **Vitest 5.1** + **@vue/test-utils 2.6** + **happy-dom 21** | Vite-native, reuses the `@` alias from `vite.config.js`, fast DOM env, first-class Vue SFC support. `jsdom` 31 is a drop-in alternative if a dependency needs it. |
| HTTP mocking | **MSW 3** | Intercepts `fetch` at the network layer, so the real API client and store actions are exercised against responses shaped by the pinned OpenAPI specs. No live URLs in tests. |
| Coverage | **@vitest/coverage-v8 5.1** | V8-based, version-matched to Vitest. |
| E2E (later phase) | **Playwright 1.65** | Real browser flows: login guard, token handling, dark mode and narrow viewport. Install only when E2E work starts. |

Versions verified against npm on 2026-11-29. Minimum runtime is **Node 24.22.1**, declared via
`engines` in `package.json`, pinned in `.nvmrc`, and enforced by `engine-strict=true` in `.npmrc`;
CI uses the exact version.

## Install (done in `P1.0`)

```powershell
npm i -D vitest@^5.1 @vue/test-utils@^2.6 happy-dom@^21 msw@^3 @vitest/coverage-v8@^5.1
# Only when starting E2E:
npm i -D @playwright/test@^1.65
npx playwright install chromium
```

Add to `package.json` scripts in the same commit as the install (no dead scripts):

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:e2e": "playwright test"
```

`vite.config.js` already defines the `@` alias, which Vitest inherits automatically. Its `test` block
sets `environment: 'happy-dom'`, `setupFiles: ['./tests/setup.js']`, `clearMocks`/`restoreMocks`, and
`environmentOptions.happyDOM.url = 'http://localhost:8000/'` — the last one keeps mocked requests
same-origin so happy-dom does not fire an unmatchable CORS preflight `OPTIONS` request.

## Test layout

```text
tests/
├── setup.js                     # localStorage + Pinia + i18n + toast reset, MSW server lifecycle
├── unit/
│   ├── api/client.spec.js       # envelope unwrap, typed ApiError, bearer header, timeout
│   ├── api/errors.spec.js       # error_code → i18n key, never message matching
│   ├── api/token.spec.js        # per-surface token isolation, no token in state/logs
│   ├── stores/mappers.spec.js   # DTO → legacy store shape (lease_renters → lease_tenants)
│   ├── stores/actions.spec.js   # demo vs live branches, reload after mutation, notify()
│   └── utils/format.spec.js     # currency/date helpers (BDT default, localeAware)
├── component/                   # one smoke + interaction test per changed view
└── e2e/                         # Playwright, later phase
```

## Test rules (non-negotiable)

1. **No live URLs.** All HTTP is intercepted by MSW handlers built from `docs/api/openapi/*.json`.
   A test that reaches the network is a failing test.
2. **Branch on `error_code`, never message text** — assert the code in both code and tests.
3. **Token isolation:** assert staff / renter / platform tokens are stored under separate keys and
   that a token is never sent to another surface, never logged, and never written into
   `zoniq-ui-state-v1`.
4. **Reset global state** in `beforeEach`: `localStorage.clear()`, fresh Pinia, i18n locale back to
   `en`, toast stack emptied, MSW handlers reset. Use `afterAll` to stop the MSW server.
5. **Demo and live are both tested.** Every dual-mode action needs a test for each mode; demo must
   still mutate seed state, live must call the pinned endpoint and refresh state.
6. **Pagination and error paths:** cover `meta`/`links`, `?page=`, 401 clearing tokens, 404 on
   foreign ids, 422 field errors, 429 and `PLAN_EXPIRED`.
7. **i18n parity test:** fail if any key used by the app is missing from either `en` or `bn`, and
   check that raw `@` is escaped as `{'@'}`.
8. **Behavior over snapshots:** assert rendered text, emitted events and store state — no whole-view
   snapshots that break on harmless markup changes.
9. **Tests ship with code.** A task is not done until its tests are committed and both
   `npm run test` and `npm run build` pass.

## Coverage targets

| Area | Target |
| --- | --- |
| `src/api/client.js`, `errors.js`, `token.js`, `mappers.js` | 100% statements/branches |
| Store actions (`src/stores/app.js`) | ≥ 80% statements, every action has at least one test |
| Views | One interaction test per view changed in the live migration |
| E2E (later) | Login → dashboard → one mutation, in both themes and a narrow viewport |

Run `npm run test:coverage` at the end of each phase and record the result in the plan's progress log.
Current result after `P1.0`/`P1.1`: **25 tests passing, 100% statements/branches/functions/lines** for
the covered `src/api/*` modules (`client.js`, `errors.js`, `token.js`) and the i18n parity test.

## Verification ladder

| Level | Command / action | When |
| --- | --- | --- |
| Task | `npm run test -- --run <file>` and `npm run build` | Every task |
| Phase | `npm run test`, `npm run test:coverage`, `/review` | End of each phase |
| CI | `.github/workflows/ci.yml`: `npm ci`, `npm run test:coverage`, `npm run build`, coverage artifact | Every push and PR |
| Release | `npm run test:e2e`, manual light + dark + narrow viewport, no console errors | Before merge |

## Deferred to E2E phase

- Renter and platform token separation in a real browser (separate surfaces, never mixed).
- SSLCommerz / Stripe redirects are **not** E2E-tested from the UI: the UI never calls webhook routes.
- Contract sync (`npm run api:sync`) is a build-time script, not a runtime dependency; it is verified
  by checking the regenerated hashes in `docs/api/CONTRACT.md`.
