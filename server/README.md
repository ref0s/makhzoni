# Inventory Backend

Express + SQLite backend for the Makhzoni inventory dashboard. The service exposes admin authentication, category management, and inventory CRUD with low-stock insights.

## Prerequisites
- Node.js 18+
- npm 9+

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file if you need to override defaults (optional).
3. Run the development server with automatic reload:
   ```bash
   npm run dev
   ```
4. Start the compiled server (used in production environments):
   ```bash
   npm start
   ```

The first boot runs migrations and seeds a default admin when none exists.

## Environment Variables
| Variable | Default | Notes |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port |
| `DATABASE_FILE` | `<repo>/server/data/makhzoni.db` | SQLite database path |
| `ADMIN_EMAIL` | `admin@example.com` | Seed admin email |
| `ADMIN_PASSWORD` | `password123` | Seed admin password (hashed automatically) |
| `ADMIN_NAME` | `Admin User` | Seed admin display name |
| `SESSION_TTL_MINUTES` | `60` | Session lifetime |

## Available Scripts
- `npm run dev` – Nodemon watcher for local development
- `npm start` – Launches the API with Node

## API Reference

All inventory and category routes require a `Bearer <token>` header from a successful login. Responses use JSON.

### Auth
- `POST /auth/login`
  - Body: `{ "email": "string", "password": "string" }`
  - Success: `{ "token": "string", "admin": { "id": "string", "email": "string", "name": "string" } }`

### Items
- `GET /items` → Array of item objects (includes `categoryName`)
- `GET /items/low-stock` → Items where `quantity < minThreshold`
- `POST /items`
  - Body: `{ "name": "...", "categoryId": "uuid|null", "quantity": number, "minThreshold": number, "price": number }`
  - Success: created item (201)
- `PATCH /items/:id`
  - Body: any combination of `name`, `categoryId`, `quantity`, `minThreshold`, `price`, or `{ "delta": number }`
  - Success: `{ "message": "Stock updated successfully", "item": Item }`
- `DELETE /items/:id`
  - Success: `{ "success": true }`

### Categories
- `GET /categories` → Array of categories
- `GET /categories/:categoryId/items` → Items filtered by category
- `POST /categories`
  - Body: `{ "name": "string", "color": "string|null", "icon": "string|null" }`
  - Success: created category (201)
- `PATCH /categories/:id`
  - Body: any combination of `name`, `color`, `icon`
  - Success: updated category
- `DELETE /categories/:id?force=true|false`
  - Without `force=true` and with dependent items → `{ "success": false, "dependentItems": [...] }`
  - With `force=true` → `{ "success": true }` after detaching items

### Health
- `GET /health` → `{ "status": "ok" }`

## Manual Test Plan
1. **Migrations & Seed**
   - Delete `server/data/makhzoni.db` (optional).
   - Run `npm start`.
   - Confirm database file recreates and server logs.
2. **Login (FR0)**
   - `POST /auth/login` with default credentials.
   - Expect token + admin object.
3. **Create Category (FR8)**
   - `POST /categories` with name and color.
   - Expect 201 with category payload.
4. **Create Item (FR1)**
   - `POST /items` with categoryId from step 3.
   - Expect 201 created item referencing category.
5. **Inventory List (FR4)**
   - `GET /items`.
   - Expect array containing the created item with `categoryName`.
6. **Low Stock (FR5)**
   - Create an item with `quantity < minThreshold` or patch existing using `delta`.
   - `GET /items/low-stock` should include it.
7. **Update Stock (FR3)**
   - `PATCH /items/:id` with `delta` value.
   - Expect message `"Stock updated successfully"` and updated item.
8. **Remove Item (FR2)**
   - `DELETE /items/:id`.
   - Expect `{ success: true }` and item removed on next list.
9. **Category Filter (FR6)**
   - `GET /categories/:categoryId/items` returns only items from that category.
10. **Update Category (FR9)**
    - `PATCH /categories/:id` with new fields.
    - List categories to confirm change.
11. **Delete Category (FR10)**
    - `DELETE /categories/:id` without `force=true`; expect dependent item list.
    - Repeat with `force=true`; expect `{ success: true }` and items now have `categoryId = null`.

## Project Structure
```
server/
  src/
    app.js                # Express app wiring
    server.js             # Bootstrap + DB init
    config/               # Environment config
    controllers/          # HTTP handlers
    database/             # SQLite client, migrations, seed logic
    middleware/           # Logging, auth, errors
    models/               # Database access helpers
    routes/               # Express routers
    services/             # Domain logic and validations
    validators/           # Zod schemas
    utils/                # Shared helpers
  data/                   # SQLite database file
```
