# Backend Delivery Plan

## 1. Scaffold & Tooling
1. Create `server/` directory.
2. Initialize Node project (`npm init -y`) and install: `express`, `cors`, `sqlite3`, `better-sqlite3` _or_ `sqlite`, `dotenv`, `zod`, plus dev deps `typescript`, `ts-node`, `nodemon`, `@types/express`, `@types/node`.
3. Add `tsconfig.json`, `nodemon.json`, and scripts: `dev` (nodemon), `build` (tsc), `start` (node dist/server.js).

## 2. Project Structure (MVC)
```
server/
  src/
    app.ts          // express app + middleware
    server.ts       // http bootstrap
    config/         // env, constants
    database/       // sqlite client, migrations/seeders
    models/         // data access (repos)
    services/       // business logic
    controllers/    // request handlers
    routes/         // express routers
    validators/     // zod schemas
    middleware/     // auth, errors, logging
```

## 3. Database
1. Use SQLite file (e.g., `server/data/makhzoni.db`).
2. Create migration script for tables: `admins`, `categories`, `items`, optionally `sessions`.
3. Seed default admin credentials (hash password).

## 4. Features To Implement
- **FR0 Admin Login**: POST `/auth/login` validates email/password, returns `{ token, admin }` token (JWT or signed UUID). Store session metadata if required.
- **FR1 Add Item**: POST `/items` accepts `{ name, categoryId|null, quantity, minThreshold, price }`, validates, persists, returns created item.
- **FR2 Remove Item**: DELETE `/items/:id` removes item; optionally support quantity decrement via PATCH body `{ delta }`.
- **FR3 Update Stock**: PATCH `/items/:id` updates quantity and other mutable fields; respond with updated item and `"Stock updated successfully"`.
- **FR4 View Inventory**: GET `/items` returns array of items including category info.
- **FR5 Low Stock Alert**: GET `/items/low-stock` (or flag in `/items`) returns items with `quantity < minThreshold`, each including `categoryName`.
- **FR6 View by Category**: GET `/categories/:id/items` filters items by category (supports dashboard category selector).
- **FR8 Add Category**: POST `/categories` creates category with `{ name, color }`.
- **FR9 Edit Category**: PATCH `/categories/:id` renames category.
- **FR10 Delete Category**: DELETE `/categories/:id` first responds with dependent items list; require confirmation flag (e.g., query `?force=true`) to execute deletion and return `{ success: true }`.

_Note_: FR7 is out of scope and must not be implemented.

## 5. Middleware & Validation
- Global middleware: `cors`, `express.json()`, request logging, error handler returning `{ message, details }`.
- Auth middleware protects inventory/category routes (verify token).
- Validation via Zod schemas in `validators/` for each request payload.

## 6. Testing & Verification
1. Add `npm run dev` instructions and manual test plan for each endpoint (login, items CRUD, categories CRUD, low-stock).
2. Optionally use supertest for automated integration tests.

## 7. Documentation Deliverables
- `server/README.md` covering setup, .env variables, scripts.
- API reference (endpoints, request/response JSON, success/error codes).

## 8. Frontend Contracts (Must Match)

### Auth
- Request: `{ "email": "string", "password": "string" }`
- Response: `{ "token": "string", "admin": { "id": "string", "email": "string", "name": "string" } }`

### Category Object
```json
{
  "id": "string",
  "name": "string",
  "color": "string|null",
  "icon": "string|null"
}
```

### Item Object
```json
{
  "id": "string",
  "name": "string",
  "quantity": "number",
  "minThreshold": "number",
  "price": "number",
  "categoryId": "string|null",
  "categoryName": "string|null",
  "lastUpdated": "ISO string"
}
```

### Item Create/Update Payload
```json
{
  "name": "string",
  "categoryId": "string|null",
  "quantity": "number",
  "minThreshold": "number",
  "price": "number"
}
```

### Generic Success
```json
{ "success": true, "message": "string" }
```

## 9. Outstanding Frontend Gaps
- Implement frontend confirmation flow for FR10 using backend-provided dependent items.
- Update low-stock alert component to display `"Low stock for [Item Name] in [Category]"` once backend supplies `categoryName`.
