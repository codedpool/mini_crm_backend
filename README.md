# Mini CRM Backend (Prysm Labs Assignment)

Backend for a mini CRM system built for the Prysm Labs Backend Developer Intern assignment. Implements authentication, role-based authorization, and CRUD operations for Users, Customers, and Tasks using Node.js, Express, PostgreSQL, and Prisma ORM.

![Mini CRM API Screenshot](./image.png)

---

## Tech Stack

- Node.js (Express)
- PostgreSQL
- Prisma ORM (v6)
- JWT Authentication (`jsonwebtoken`)
- Password hashing (`bcrypt`)
- Input validation (`joi`)
- API Documentation: Swagger (`swagger-ui-express`, `swagger-jsdoc`)
- Logging & security middleware: `morgan`, `helmet`, `cors`

---

## Project Structure

```txt
mini-crm-backend/
├─ prisma/
│  ├─ schema.prisma          # Prisma models (User, Customer, Task, enums)
├─ src/
│  ├─ app.js                 # Express app setup (middlewares, Swagger, routes)
│  ├─ server.js              # Server bootstrap (reads PORT from .env)
│  ├─ config/
│  │  └─ prisma.js           # PrismaClient instance
│  ├─ controllers/           # HTTP controllers (no business logic)
│  │  ├─ auth.controller.js
│  │  ├─ users.controller.js
│  │  ├─ customers.controller.js
│  │  └─ tasks.controller.js
│  ├─ services/              # Business logic (uses Prisma)
│  │  ├─ auth.service.js
│  │  ├─ users.service.js
│  │  ├─ customers.service.js
│  │  └─ tasks.service.js
│  ├─ middlewares/
│  │  ├─ auth.middleware.js  # JWT verification
│  │  └─ role.middleware.js  # Role-based access control
│  ├─ routes/                # Express route definitions + Swagger docs
│  │  ├─ auth.routes.js
│  │  ├─ users.routes.js
│  │  ├─ customers.routes.js
│  │  └─ tasks.routes.js
├─ scripts/
│  └─ smoke-test.js          # Simple end-to-end smoke test script
├─ .env                      # Environment variables (not committed)
├─ .env.example              # Example env variables
├─ package.json
└─ README.md
```

---

## Database Schema (Prisma)

`prisma/schema.prisma` defines 3 core models and enums:

User

id, name, email (unique), password (hashed), role (ADMIN or EMPLOYEE), createdAt

Relation: tasks (one-to-many)

Customer

id, name, email (unique), phone (unique), company, createdAt, updatedAt

Relation: tasks (one-to-many)

Task

id, title, description, status (PENDING, IN_PROGRESS, DONE)

assignedTo (FK to User with role EMPLOYEE)

customerId (FK to Customer, cascade on delete)

createdAt, updatedAt

Enums:

- Role: ADMIN, EMPLOYEE
- TaskStatus: PENDING, IN_PROGRESS, DONE

---

## Setup Instructions

### 1. Prerequisites

- Node.js (LTS)
- PostgreSQL running locally (e.g., on `localhost:5432`)

Create a PostgreSQL database, e.g.:

sql
CREATE DATABASE crm_db;
2. Clone and install dependencies
bash
git clone <your-repo-url>
cd mini-crm-backend
npm install
```

### 3. Environment variables

Create a `.env` file in the project root (based on `.env.example`):

```text
# .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/crm_db?schema=public"
JWT_SECRET="your_jwt_secret_here"
PORT=3000
```

- **DATABASE_URL:** Adjust username, password, host, port, and db name as per your local PostgreSQL setup.
- **JWT_SECRET:** Any strong random string.
- **PORT:** Optional; defaults to 3000.

### 4. Database migration (Prisma)

Generate client and apply schema:

```bash
npx prisma migrate dev --name init_schema
```

(Optional) Open Prisma Studio to inspect tables:

```bash
npx prisma studio
```

---

## Running the Server

### Development

```bash
npm run dev
```

The server will start on http://localhost:3000.

- **Health check:** `GET /` → `{ "message": "Mini CRM Backend is running!" }`
- **Swagger UI:** http://localhost:3000/api-docs

### Production (simple)

```bash
npm start
```

---

## API Documentation (Swagger)
Swagger is configured using swagger-jsdoc + swagger-ui-express and reads JSDoc comments from `src/routes/*.js`.

Visit: http://localhost:3000/api-docs

Supports:

Request/response schemas

JWT Bearer auth (click “Authorize” and paste Bearer <token>)

Authentication & Authorization
Roles
ADMIN

EMPLOYEE

JWT
Login returns accessToken (JWT) and user details.

JWT payload includes: userId, role.

Protected routes require header:

text
Authorization: Bearer <accessToken>
Middlewares
auth.middleware.js: Verifies JWT, attaches req.user = { userId, role }.

role.middleware.js: Ensures req.user.role is in allowed roles; else 403 Forbidden.

Core Modules and Endpoints
### 1. Auth Module

Base path: `/auth`

#### POST /auth/register

Registers a new user (ADMIN or EMPLOYEE).

**Request body:**

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "ADMIN"
}
```

**Rules:**
- Valid email, unique.
- Password min 8 chars and stored hashed (bcrypt).
- Response returns: `id`, `name`, `email`, `role` (no password).

#### POST /auth/login

Logs in a user and returns JWT.

**Request:**

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "accessToken": "<JWT>",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

**Errors:**
- 401 Unauthorized for invalid email/password.

### 2. Users Module (Admin Only)

Base path: `/users`  
Access: **ADMIN only**

#### GET /users

Returns list of users.

**Response shape:**

```json
[
  {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN",
    "createdAt": "..."
  }
]
```

#### GET /users/:id

Returns single user by id.

- 404 if not found.

#### PATCH /users/:id

Updates role only.

**Request:**

```json
{
  "role": "EMPLOYEE"
}
```

- Valid roles: ADMIN, EMPLOYEE.
- Errors: 400 for invalid role, 404 if user not found.

### 3. Customers Module

Base path: `/customers`

**Access Control:**

- **ADMIN:** full CRUD.
- **EMPLOYEE:** read-only (GET /customers, GET /customers/:id).

#### POST /customers (ADMIN only)

Creates a new customer.

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9999999999",
  "company": "Acme Inc"
}
```

**Constraints:**
- `email` unique
- `phone` unique

**Errors:**
- 400 for validation errors.
- 409 for duplicate email/phone.

#### GET /customers (ADMIN + EMPLOYEE)

Returns paginated customers.

**Query params:**
- `page` (default: 1)
- `limit` (default: 10)

**Response:**

```json
{
  "page": 1,
  "limit": 10,
  "totalRecords": 2,
  "totalPages": 1,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9999999999",
      "company": "Acme Inc",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### GET /customers/:id (ADMIN + EMPLOYEE)

Returns customer by id.

- 404 if not found.

#### PATCH /customers/:id (ADMIN only)

Partial update of name, email, phone, company.

#### DELETE /customers/:id (ADMIN only)

Deletes a customer.

- 204 No Content on success.
- 404 if not found.

### 4. Tasks Module

Base path: `/tasks`

**Access Control & Rules:**

**ADMIN:**
- Can create tasks.
- Can view all tasks.
- Can update status of any task.

**EMPLOYEE:**
- Can view only tasks assigned to them.
- Can update status only for their own tasks.

- `assignedTo` must be an existing user with role EMPLOYEE.
- `customerId` must be an existing customer.

#### POST /tasks (ADMIN only)

Creates a task.

**Request:**

```json
{
  "title": "Call customer",
  "description": "Follow up on proposal",
  "assignedTo": 2,
  "customerId": 1,
  "status": "PENDING"
}
```

- Defaults: `status` = PENDING if not provided.

**Errors:**
- 404 if assigned user not found or not an EMPLOYEE.
- 404 if customer not found.

**Response includes:**
- Task fields.
- `assignedTo` user metadata (id, name, email).
- `customer` metadata (id, name, email, phone).

#### GET /tasks (ADMIN + EMPLOYEE)

- If ADMIN: returns all tasks.
- If EMPLOYEE: returns only tasks where `assignedTo` = current user.

Each task includes:

```json
{
  "id": 1,
  "title": "...",
  "description": "...",
  "status": "PENDING",
  "assignedTo": 2,
  "customerId": 1,
  "createdAt": "...",
  "updatedAt": "...",
  "user": { "id": 2, "name": "Emp", "email": "emp@example.com" },
  "customer": { "id": 1, "name": "John", "email": "john@example.com", "phone": "9999999999" }
}
```

#### PATCH /tasks/:id/status (ADMIN + EMPLOYEE)

**Request:**

```json
{
  "status": "IN_PROGRESS"
}
```

**Rules:**
- EMPLOYEE can only update tasks assigned to them. Else 403 Forbidden.
- ADMIN can update any task.
- 404 if task not found.

---

## Example curl Commands

**Note:** Replace `<ADMIN_TOKEN>` and `<EMP_TOKEN>` with real tokens from `/auth/login`.

### Auth

**Register admin:**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@example.com","password":"password123","role":"ADMIN"}'
```

**Login:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Users (Admin only)

```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Customers

**Create:**

```bash
curl -X POST http://localhost:3000/customers \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","phone":"9999999999","company":"Acme"}'
```

**List:**

```bash
curl -X GET "http://localhost:3000/customers?page=1&limit=10" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Tasks

**Create task as admin:**

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Call customer","description":"Follow up","assignedTo":2,"customerId":1,"status":"PENDING"}'
```

**Get tasks as admin:**

```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Update status:**

```bash
curl -X PATCH http://localhost:3000/tasks/1/status \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"DONE"}'
```

---

## Smoke Test Script

A simple script is included to verify main flows end-to-end:

```bash
npm run smoke:test
```

It performs:
- Register admin.
- Login admin (get JWT).
- Register employee.
- Create customer.
- Create task assigned to employee.
- List tasks as admin.
- Check console output to confirm all steps return expected statuses (201 / 200).

---

## Notes

- No Docker is used for this implementation; PostgreSQL is expected to be running locally.
- Passwords are never returned in any API response.
- All protected routes enforce JWT auth and role checks.
- Error codes follow assignment guidelines: 400, 401, 403, 404, 409 as appropriate.