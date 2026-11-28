# API conventions (agent quick reference — frontend copy)

Pinned machine-readable contracts: [`openapi/`](openapi/). Metadata and source
URLs: [`CONTRACT.md`](CONTRACT.md). Integration guide:
[`../API_INTEGRATION.md`](../API_INTEGRATION.md).

All four generated documents include bearer security for authenticated surfaces
and the real error envelope (`status`, `error_code`, `message`, `errors`); list
responses declare `data` as an array of items.

## Surfaces

| Surface | Prefix | Guard |
|---------|--------|-------|
| Staff | `/api/v1` | `auth:sanctum` |
| Renter | `/api/v1/renter` | `auth:tenant` |
| Platform | `/api/v1/platform` | `auth:platform` |
| Webhooks | `/api/v1/webhooks` | signature only |

A token must never work on another surface. The UI does not call webhooks.

## Envelope

```json
{ "status": "success", "message": "Success", "data": {} }
{ "status": "error", "error_code": "VALIDATION_ERROR", "message": "...", "errors": {} }
```

`errors` may be `null`, `{}` or `[]`. Branch on `error_code`, never on message
text.

## Rules

- snake_case JSON keys; integers for ids; ids are selectors, never authority.
- Money = decimal string with 2 digits; currency default `BDT` (F-30). An
  organization may override it via `settings.currency` (3 uppercase letters).
  Rent charges carry `currency`, `vat_rate`, `vat_amount` and `total_due`;
  VAT is zero by default and a balance never mixes currencies.
- Dates `YYYY-MM-DD`; timestamps ISO-8601 with offset. UI formatting uses
  `src/utils/format.js` and never changes API values.
- Enums use exact lowercase strings from the endpoint doc. The method catalogue
  includes `gateway` (`stripe` / `sslcommerz` / `null`); the frontend selects a
  gateway by posting the matching `method`. SSLCommerz accepts BDT only in v1.
- Gateway redirects are advisory; only IPN + Order Validation API settle a
  payment. `payment_sessions` expose `status` and `session_key` for polling.
- Pagination: every list endpoint accepts `?page=` (1-based) and returns `data`
  as the **item array** plus top-level `meta` (`current_page`, `last_page`,
  `per_page` = 20, `total`) and `links`. Out-of-range pages return `data: []`.
- Invitation tokens go in request bodies, never URLs or logs.
- Unauthorized/foreign ids → `404`, never a 403 that reveals existence.
- No UI that reveals whether an email is registered.

## Refreshing contracts

Run `npm run api:sync` after a backend contract release. It fetches the live
OpenAPI URLs configured in `.env`, rewrites `docs/api/openapi/*.json`, and
updates `docs/api/CONTRACT.md`. Commit the result. Do not fetch contracts at
runtime or from application code.
