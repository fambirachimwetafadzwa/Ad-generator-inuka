# SyncPOS

Front-end (UI-only) implementation of the SyncPOS MVP described in the POS System Requirements Specification.
All data is mocked in `packages/shared/src/mock.ts`; there is no backend yet.

| Package | Purpose | Run |
|---|---|---|
| `apps/pos` | Cashier terminal (kiosk UI): PIN login, shift open, catalogue, cart, manager-authorised voids, payments, receipt, cash-up, simulated offline queue | `npm run dev:pos` → http://localhost:5173 |
| `apps/back-office` | Admin UI: dashboard, sales reports, departments, products, inventory, stock take & variance, cash-ups, audit trail, employees, stores/terminals, printers, payment methods | `npm run dev:bo` → http://localhost:5174 |
| `packages/shared` | Types, mock data, formatting helpers, theme | — |

```
npm install
npm run dev:pos      # demo PINs: manager 1111, cashiers 2222 / 3333
npm run dev:bo
npm run build
```
