# Bi-a Shop Monorepo

Single-repo ecommerce application for billiard cues:
- Backend: Node.js + Express + SQL Server + JWT
- Frontend: React + Vite + React Router
- Database: Microsoft SQL Server

## Project Structure

```
Bi-aShop/
  backend/
  frontend/
  package.json
```

## Implemented Features

- JWT authentication (register/login/me)
- Role-based authorization (ADMIN, USER)
- Product CRUD (ADMIN can create/update/delete)
- Cart (add/update/remove items)
- Checkout and order creation
- Payment simulation (pay order)
- Admin order status management

## Quick Start

1. Run SQL script: `backend/src/sql/schema.sql`
2. Copy `backend/.env.example` to `backend/.env`
3. (Optional) Copy `frontend/.env.example` to `frontend/.env`
4. Install dependencies:

```bash
npm install
```

5. Run backend + frontend together:

```bash
npm run dev
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

## Seed Admin Account

- Email: `admin@biashop.local`
- Password: `Admin@123`

## API Routes

- Health: `GET /api/health`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Products: `GET /api/products`, `GET /api/products/:id`
- Products admin: `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`
- Cart: `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/:itemId`, `DELETE /api/cart/items/:itemId`
- Orders: `POST /api/orders/checkout`, `GET /api/orders/my`, `GET /api/orders`, `PATCH /api/orders/:id/status`
- Payments: `GET /api/payments/order/:orderId`, `POST /api/payments/order/:orderId/pay`
