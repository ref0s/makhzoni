# Makhzoni Inventory Management System

## Project Overview

Makhzoni is a simple web-based inventory management system designed to help administrators track items, manage categories, and monitor stock levels, with a focus on low-stock alerts. The application consists of a React frontend and a Node.js Express backend, utilizing SQLite for data persistence.

## Features

The system implements the following functionalities:

- **FR0 Admin Login**: Secure login for administrators with hashed passwords.
- **FR1 Add Item**: Add new inventory items with details like name, category, quantity, minimum threshold, and price.
- **FR2 Remove Item**: Delete existing inventory items.
- **FR3 Update Stock**: Update item quantities, including incrementing/decrementing. Allows for general item detail updates (name, price, etc.).
- **FR4 View Inventory**: Display a list or grid of all inventory items.
- **FR5 Low Stock Alert**: Provides real-time low stock notifications via toasts and a dedicated drawer.
- **FR6 View by Category**: Filter items by category.
- **FR8 Add Category**: Create new item categories with names and colors.
- **FR9 Edit Category**: Rename existing categories.
- **FR10 Delete Category**: Delete categories, with a check for dependent items and an option for forced deletion.

## System Components

### Frontend

- **Technologies**: React, Vite, TypeScript, Tailwind CSS, shadcn-ui, Axios.
- **Key Components**:
  - `Login.tsx`: Handles administrator authentication.
  - `Dashboard.tsx`: The main application dashboard, managing item and category data, filtering, and displaying alerts.
  - `InventoryGrid.tsx`: Displays inventory items in a grid or list view, allowing quantity adjustments, editing, and deletion.
  - `AddItemDialog.tsx`: A dialog for adding new inventory items.
  - `EditItemDialog.tsx`: A dialog for editing existing inventory item details.
  - `CategoryManager.tsx`: A dialog for adding, renaming, and deleting categories.
- **Purpose**: Provides an intuitive user interface for managing inventory, viewing data, and interacting with backend services.

### Backend

- **Technologies**: Node.js, Express.js, `better-sqlite3`, `dotenv`, `bcrypt`, `uuid`.
- **Architecture**: Simple MVC-like structure.
  - `server.js`: Application entry point, HTTP server bootstrap.
  - `app.js`: Express application setup, middleware configuration (CORS, JSON parsing, logging, error handling).
  - `controllers/`: Handle incoming HTTP requests and interact with models.
    - `authController.js`: Manages admin login.
    - `itemController.js`: Handles CRUD operations for inventory items.
    - `categoryController.js`: Handles CRUD operations for categories.
  - `models/`: Interact directly with the SQLite database.
    - `db.js`: Initializes database (creates tables, seeds admin), provides database connection.
    - `adminModel.js`: Data access for admin users.
    - `itemModel.js`: Data access for inventory items.
    - `categoryModel.js`: Data access for categories.
  - `routes/`: Define API endpoints and direct them to appropriate controllers.
  - `middleware/`: Custom Express middleware for logging, authentication (removed due to simplified architecture), and error handling.
- **Purpose**: Provides RESTful API endpoints for the frontend to manage inventory data.

### Database

- **Technology**: SQLite (`makhzoni.db`).
- **Tables**:
  - `admins`: Stores administrator credentials (id, email, hashed password, name).
  - `categories`: Stores item categories (id, name, color, icon).
  - `items`: Stores inventory item details (id, name, quantity, minThreshold, price, categoryId, lastUpdated).
- **Seeding**: Automatically seeds a default admin user (`admin@example.com` / `password123`) upon initial database creation.

## Workflow

### Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd makhzoni
    ```

2.  **Backend Setup**:

    - Navigate to the `server` directory: `cd server`
    - Install dependencies: `npm install`
    - Delete the SQLite database file (if it exists from previous runs) to ensure a fresh setup with hashed passwords: `rm ./data/makhzoni.db`
    - Start the backend server: `npm start` (This will create `makhzoni.db` and seed the admin user).

3.  **Frontend Setup**:

    - Navigate to the `makhzoni` directory: `cd ../makhzoni`
    - Install dependencies: `npm install`
    - Start the frontend development server: `npm run dev`

    The frontend should now be accessible at `http://localhost:5173/` (or another port as indicated by Vite).

### Login

- Access the frontend in your browser.
- Use the following credentials:
  - **Email**: `admin@example.com`
  - **Password**: `password123`

### Item Management

- **Add Item**: Click the "Add Item" button to open the dialog, fill in details, and save.
- **View Items**: Items are displayed in either a grid or list view on the dashboard.
- **Search**: Use the search bar to filter items by name.
- **Filter by Category**: Use the category dropdown to view items belonging to a specific category.
- **Filter by Status**: Use the status dropdown to view "All Statuses", "Low Stock", or "In Stock" items.
- **Update Quantity**: Use the `+` and `-` buttons on each item to adjust its quantity.
- **Edit Item**: Click the pencil icon on an item to open the edit dialog and modify its name, quantity, min threshold, price, or category.
- **Delete Item**: Click the trash icon on an item to delete it.

### Category Management

- **Manage Categories**: Click the "Categories" button (next to "Add Item") to open the Category Manager dialog.
- **Add Category**: In the Category Manager, enter a new category name and select a color, then click "Add Category".
- **Rename Category**: In the Category Manager, click the pencil icon next to an existing category, enter a new name, and save.
- **Delete Category**: In the Category Manager, click the trash icon next to a category. If the category has dependent items, you will be prompted to confirm the deletion (which will clear the `categoryId` for those items).

### Low Stock Alerts

- **Toasts**: When an item's quantity falls below its `minThreshold`, a toast notification will appear.
- **Drawer**: Click the "Bell Ring" icon in the header to open a left-side drawer listing all currently low-stock items. You can edit items directly from this drawer.

## API Routes

All backend API endpoints are served from `http://localhost:3000/`.

### Auth

- `POST /auth/login`
  - **Request Body**: `{ "email": "string", "password": "string" }`
  - **Response**: `{ "message": "string", "admin": { "id": "string", "email": "string", "name": "string" } }`

### Items

- `GET /items`
  - **Response**: `Array<InventoryItem>`
- `POST /items`
  - **Request Body**: `{ "name": "string", "categoryId": "string|null", "quantity": number, "minThreshold": number, "price": number }`
  - **Response**: `InventoryItem` (created item)
- `PATCH /items/:id`
  - **Request Body**: `Partial<InventoryItem>` (e.g., `{ "quantity": number }` or `{ "delta": number }`)
  - **Response**: `{ "message": "string", "item": InventoryItem }`
- `DELETE /items/:id`
  - **Response**: `{ "success": true }`

### Categories

- `GET /categories`
  - **Response**: `Array<Category>`
- `POST /categories`
  - **Request Body**: `{ "name": "string", "color": "string|null", "icon": "string|null" }`
  - **Response**: `Category` (created category)
- `PATCH /categories/:id`
  - **Request Body**: `Partial<Category>` (e.g., `{ "name": "string" }`)
  - **Response**: `Category` (updated category)
- `DELETE /categories/:id`
  - **Query Parameter**: `?force=true` (optional, to force delete categories with dependent items)
  - **Response (with dependent items, no force)**: `{ "success": false, "message": "string", "dependentItems": Array<{ id: string, name: string }> }`
  - **Response (success)**: `{ "success": true }`

### Health Check

- `GET /health`
  - **Response**: `{ "status": "ok" }`

## Logging

The backend includes a basic request logger middleware (`middleware/logger.js`) that logs incoming HTTP requests to the console. Errors are handled by `middleware/errorHandler.js`, which logs the error stack to the console and sends a generic 500 error response to the client or a specific message from the error.

## Purpose

The purpose of the Makhzoni Inventory Management System is to provide a straightforward and efficient tool for small to medium-sized businesses or individuals to manage their product inventory. It focuses on essential CRUD operations for items and categories, coupled with a proactive low-stock alert mechanism, to help users maintain optimal stock levels and prevent shortages.
