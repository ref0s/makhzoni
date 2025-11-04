## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) details the functional and non-functional requirements for the Makhzoni Inventory Management System, Version 1.0. The primary purpose of this system is to provide a robust, user-friendly platform for administrators to efficiently manage inventory items, organize them into categories, and proactively monitor stock levels to prevent shortages. This document serves as a foundational agreement between stakeholders and the development team, outlining what the system will achieve.

### 1.2 Scope

The Makhzoni Inventory Management System, Version 1.0, is designed for small to medium-sized businesses or individuals requiring streamlined control over their product inventory.

**In-Scope:**
*   Secure administrator login.
*   Creation, retrieval, updating, and deletion (CRUD) of inventory items.
*   Categorization of inventory items.
*   Real-time monitoring of stock levels and generation of low-stock alerts.
*   Filtering and searching capabilities for inventory data.
*   Basic reporting and display of inventory overview statistics.

**Out-of-Scope:**
*   Advanced reporting and analytics features (e.g., sales trends, predictive analytics).
*   Multi-user roles beyond a single administrator (e.g., warehouse staff, sales personnel).
*   Integration with external systems (e.g., e-commerce platforms, accounting software).
*   Complex supply chain management features (e.g., order fulfillment, supplier management).
*   Barcode scanning or physical inventory audit capabilities.
*   Internationalization or localization.

### 1.3 Definitions, Acronyms, and Abbreviations

*   **API**: Application Programming Interface
*   **CRUD**: Create, Read, Update, Delete
*   **DB**: Database
*   **FR**: Functional Requirement
*   **HTTP**: Hypertext Transfer Protocol
*   **JSON**: JavaScript Object Notation
*   **NFR**: Non-Functional Requirement
*   **UI**: User Interface
*   **UX**: User Experience
*   **SRS**: Software Requirements Specification
*   **Makhzoni**: The name of the inventory management system.
*   **Item**: A single product entry in the inventory (e.g., "Laptop HP ProBook").
*   **Category**: A classification for items (e.g., "Electronics", "Office Supplies").
*   **Min Threshold**: The minimum quantity an item should have before a low-stock alert is triggered.

### 1.4 References

*   **IEEE Std 830-1998**: IEEE Recommended Practice for Software Requirements Specifications.
*   **WORKSPACE.md**: Project development plan document.
*   **GEMINI.md**: Project overview and technical documentation.

### 1.5 Overview

The remainder of this SRS describes the overall product, its functions, user characteristics, and the specific functional, external interface, and non-functional requirements. Section 2 provides a general description of the system. Section 3 details the specific requirements, including functional requirements, external interfaces, and other attributes such as performance and security.

---

## 2. Overall Description

### 2.1 Product Perspective

The Makhzoni system is a standalone web application comprising a frontend user interface and a backend API and database. It interacts with users solely through its web-based UI. There are no direct interfaces with other software systems or hardware beyond the standard web browser and server infrastructure.

*   **Frontend**: Built with React, Vite, TypeScript, and Tailwind CSS. Users interact with this interface through a standard web browser.
*   **Backend**: Developed using Node.js with Express.js, providing RESTful API endpoints.
*   **Database**: A local SQLite database (`makhzoni.db`) stores all system data (admins, items, categories).

### 2.2 Product Functions

The primary functions of the Makhzoni system include secure user authentication, comprehensive inventory item management (add, view, update, delete), robust category management (add, view, update, delete), and a proactive low-stock alert mechanism. Users can search and filter inventory data to efficiently locate specific items or monitor stock statuses.

### 2.3 User Characteristics

The sole user profile for Makhzoni is an **Administrator**.

*   **Administrator**:
    *   Possesses basic computer literacy and familiarity with web applications.
    *   Responsible for all aspects of inventory and category management.
    *   Requires secure access to the system.
    *   Needs to quickly identify low-stock items.

### 2.4 Constraints

*   **Technology Stack**: The system must adhere to the chosen technology stack:
    *   Frontend: React, Vite, TypeScript, Tailwind CSS, Axios.
    *   Backend: Node.js, Express.js, `better-sqlite3`, `bcrypt`, `dotenv`, `uuid`.
    *   Database: SQLite.
*   **No Token Authentication**: For simplicity, authentication is session-based (admin object stored in sessionStorage on frontend) and does not utilize JWT or other token-based mechanisms.
*   **Local Database**: Data is stored in a single, local SQLite file.
*   **Single User Type**: Only one type of user (Administrator) is supported.
*   **Web-Based Interface**: Access is exclusively through a web browser.

### 2.5 Assumptions and Dependencies

*   **Node.js Environment**: It is assumed that a compatible Node.js runtime environment (version 18+) and npm (version 9+) are installed on the deployment machine for both frontend and backend.
*   **Browser Compatibility**: The system is assumed to be compatible with modern web browsers (e.g., latest Chrome, Firefox, Edge, Safari).
*   **Database Integrity**: The SQLite database file (`makhzoni.db`) will reside locally on the server and is assumed to be accessible by the backend application. External manipulation of the database file is out of scope and could lead to data inconsistencies.
*   **Network Connectivity**: Stable network connectivity between the client browser and the server is assumed.

---

## 3. Specific Requirements

### 3.1 Functional Requirements

This section details the specific functional requirements of the Makhzoni Inventory Management System.

#### FR0: Admin Authentication

*   **Description**: The system shall allow an administrator to securely log in using a registered email and password.
*   **Input**: Administrator's Email (string), Password (string).
*   **Processing**:
    1.  Receive email and password.
    2.  Validate input (email format, password length).
    3.  Retrieve administrator record from the database based on email.
    4.  Compare provided password with the stored hashed password using `bcrypt`.
*   **Output**:
    *   **Success**: HTTP 200 OK with administrator's basic details (ID, email, name).
    *   **Failure**: HTTP 400 Bad Request if input is invalid, or HTTP 401 Unauthorized if credentials do not match, with an appropriate error message.

#### FR1: Add Item

*   **Description**: The system shall allow an administrator to add a new inventory item with essential details.
*   **Input**: Item Name (string), Category ID (string, optional), Quantity (integer), Minimum Threshold (integer), Price (float).
*   **Processing**:
    1.  Generate a unique ID for the new item.
    2.  Validate input (e.g., name not empty, quantity/threshold/price >= 0).
    3.  Persist the new item record in the database.
*   **Output**:
    *   **Success**: HTTP 201 Created with the full details of the newly added item.
    *   **Failure**: HTTP 400 Bad Request with an error message if validation fails.

#### FR2: Remove Item

*   **Description**: The system shall allow an administrator to delete an existing inventory item.
*   **Input**: Item ID (string).
*   **Processing**:
    1.  Validate Item ID.
    2.  Attempt to delete the item record from the database.
*   **Output**:
    *   **Success**: HTTP 200 OK with a success status.
    *   **Failure**: HTTP 400 Bad Request if ID is invalid, or HTTP 404 Not Found if the item does not exist, with an appropriate error message.

#### FR3: Update Item Details and Stock

*   **Description**: The system shall allow an administrator to update various details of an existing inventory item, including its name, quantity, minimum threshold, price, and category. It shall also support updating the quantity by a specified delta.
*   **Input**: Item ID (string), one or more of: Item Name (string, optional), Category ID (string, optional), Quantity (integer, optional), Minimum Threshold (integer, optional), Price (float, optional), Delta (integer, optional).
*   **Processing**:
    1.  Validate Item ID and provided update fields.
    2.  If `delta` is provided, calculate the new quantity based on the current quantity and the delta.
    3.  Update the item record in the database with the provided fields or calculated quantity.
*   **Output**:
    *   **Success**: HTTP 200 OK with the updated item details.
    *   **Failure**: HTTP 400 Bad Request if input is invalid, or HTTP 404 Not Found if the item does not exist, with an appropriate error message.

#### FR4: View All Inventory Items

*   **Description**: The system shall display a comprehensive list of all inventory items, including their name, category (with category name), quantity, minimum threshold, price, and last updated timestamp.
*   **Input**: None (GET request).
*   **Processing**:
    1.  Retrieve all item records from the database.
    2.  Perform a join with category data to include category name.
*   **Output**:
    *   **Success**: HTTP 200 OK with an array of `InventoryItem` objects.
    *   **Failure**: HTTP 500 Internal Server Error in case of database access issues.

#### FR5: Low Stock Alerting

*   **Description**: The system shall notify the administrator when an item's current quantity falls below its predefined minimum threshold. Notifications will appear as temporary UI toasts and be listed in a dedicated "Low Stock Alerts" drawer.
*   **Input**: None (triggered internally by data changes).
*   **Processing**:
    1.  Continuously monitor item quantities against their minimum thresholds.
    2.  Identify items where `quantity < minThreshold`.
*   **Output**:
    *   **UI Toast**: A temporary notification (`"Low stock alert: [Item Name] ([Quantity] left)"`).
    *   **Low Stock Drawer**: A list of all low-stock items, accessible via a dedicated icon in the header, allowing direct access to edit the item.

#### FR6: View Items by Category

*   **Description**: The system shall allow an administrator to filter the displayed inventory items based on a selected category.
*   **Input**: Category ID (string).
*   **Processing**:
    1.  Validate Category ID.
    2.  Retrieve item records from the database that match the provided Category ID.
*   **Output**:
    *   **Success**: HTTP 200 OK with an array of `InventoryItem` objects belonging to the specified category.
    *   **Failure**: HTTP 400 Bad Request if Category ID is invalid, or HTTP 404 Not Found if the category does not exist, with an appropriate error message.

#### FR8: Add Category

*   **Description**: The system shall allow an administrator to define a new category for organizing inventory items.
*   **Input**: Category Name (string), Color (string, hex code, optional), Icon (string, optional).
*   **Processing**:
    1.  Generate a unique ID for the new category.
    2.  Validate input (name not empty, check for duplicate name).
    3.  Persist the new category record in the database.
*   **Output**:
    *   **Success**: HTTP 201 Created with the details of the newly added category.
    *   **Failure**: HTTP 400 Bad Request if validation fails, or HTTP 409 Conflict if a category with the same name already exists, with appropriate error messages.

#### FR9: Edit Category

*   **Description**: The system shall allow an administrator to modify details of an existing category, specifically its name, color, and icon.
*   **Input**: Category ID (string), one or more of: Category Name (string, optional), Color (string, optional), Icon (string, optional).
*   **Processing**:
    1.  Validate Category ID and provided update fields.
    2.  Check for duplicate name if the name is being updated.
    3.  Update the category record in the database.
*   **Output**:
    *   **Success**: HTTP 200 OK with the updated category details.
    *   **Failure**: HTTP 400 Bad Request if input is invalid, HTTP 404 Not Found if the category does not exist, or HTTP 409 Conflict if a category with the updated name already exists, with appropriate error messages.

#### FR10: Delete Category

*   **Description**: The system shall allow an administrator to delete an existing category. If the category has associated items, the system shall warn the administrator and require explicit confirmation for forced deletion, which will unassign the category from its dependent items.
*   **Input**: Category ID (string), Force Delete (boolean, optional query parameter `?force=true`).
*   **Processing**:
    1.  Validate Category ID.
    2.  Check if the category exists.
    3.  Identify any items currently assigned to this category.
    4.  If dependent items exist and `force` is not `true`, return a list of dependent items and a warning.
    5.  If `force` is `true` (or no dependent items), clear the `categoryId` for dependent items (set to `NULL`).
    6.  Delete the category record from the database.
*   **Output**:
    *   **Success**: HTTP 200 OK with a success status.
    *   **Warning/Conflict**: HTTP 409 Conflict with a list of dependent items and a message indicating the need for forced deletion.
    *   **Failure**: HTTP 400 Bad Request if ID is invalid, or HTTP 404 Not Found if the category does not exist, with an appropriate error message.

### 3.2 External Interface Requirements

#### 3.2.1 User Interfaces

*   **Dashboard**: Main screen displaying item inventory, search/filter controls, and access to item/category management dialogs.
*   **Login Page**: Dedicated page for administrator authentication.
*   **Add/Edit Item Dialogs**: Modal windows for creating and modifying item details.
*   **Category Manager Dialog**: Modal window for creating, renaming, and deleting categories.
*   **Low Stock Alerts Drawer**: A left-side drawer displaying a list of all low-stock items.
*   **Notifications**: Toast messages for success, warning, and error feedback.

#### 3.2.3 Software Interfaces

*   **Frontend-Backend Communication**: RESTful API endpoints described in Section 3.1, using HTTP methods (GET, POST, PATCH, DELETE) and JSON data format.
*   **Libraries/Frameworks**:
    *   **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn-ui, Axios, `react-router-dom`, `lucide-react`, `sonner`.
    *   **Backend**: Node.js, Express.js, `better-sqlite3`, `bcrypt`, `dotenv`, `uuid`, `cors`.

#### 3.2.4 Communications Interfaces

*   **Protocol**: HTTP/1.1 over TCP/IP.
*   **Endpoint**: Backend API is exposed at `http://localhost:3000/`.
*   **Data Format**: JSON for request and response bodies.

### 3.3 Performance Requirements

*   **Response Time**: All API endpoints shall respond within 500ms under typical load (up to 10 concurrent users and 1,000 items/100 categories).
*   **UI Responsiveness**: The user interface shall remain responsive, with transitions and updates occurring smoothly without noticeable delays.

### 3.4 Design Constraints

*   **No Token Authentication**: System authentication explicitly foregoes token-based mechanisms. Session management relies on simple browser storage (e.g., sessionStorage).
*   **No TypeScript on Backend**: The backend is implemented in pure JavaScript.
*   **No Zod Validation**: Backend input validation is handled manually within controllers, without external schema validation libraries like Zod.
*   **Single-Administrator Model**: The system is designed for a single administrator; multi-user support is not a requirement.

### 3.5 Software System Attributes

#### 3.5.1 Security

*   **Password Hashing**: Administrator passwords shall be stored securely in the database using `bcrypt` hashing with a suitable salt round (e.g., 10).
*   **Input Validation**: Backend API endpoints shall perform basic input validation to prevent common vulnerabilities like SQL injection and cross-site scripting (XSS), where applicable.
*   **Login Attempts**: (Implied, but could be enhanced) Prevent brute-force attacks on login (e.g., rate limiting). *Note: Not explicitly implemented but a standard security consideration.*

#### 3.5.2 Maintainability

*   **Code Clarity**: The codebase shall be structured for readability and maintainability, adhering to common JavaScript/TypeScript best practices and project-specific conventions.
*   **Modularity**: Separation of concerns shall be maintained in both frontend components and backend MVC structure.
*   **Documentation**: Inline comments and clear function/variable names shall be used to enhance understanding.

#### 3.5.3 Portability

*   **Operating System**: The backend (Node.js) and frontend (React/Vite) applications shall be portable across standard operating systems that support Node.js and modern web browsers (e.g., Windows, macOS, Linux).
*   **Database**: SQLite ensures database portability as it involves a single file.

#### 3.5.4 Reliability

*   **Error Handling**: The system shall gracefully handle unexpected inputs and internal errors, providing informative feedback to the user without crashing.
*   **Data Integrity**: Database operations shall strive to maintain data consistency (e.g., foreign key constraints for categories and items).

#### 3.5.5 Usability

*   **Intuitive Interface**: The UI shall be intuitive and easy to navigate for administrators familiar with web applications.
*   **Feedback**: The system shall provide clear and immediate feedback to user actions (e.g., success/error toasts, loading indicators).
*   **Logical Flow**: User workflows (e.g., adding an item, managing categories) shall follow a logical and predictable sequence.

---