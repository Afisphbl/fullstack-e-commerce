# E-Commerce API

Production-grade RESTful backend for an e-commerce platform — built with **Node.js**, **Express 4**, and **MongoDB/Mongoose**.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
  - [Auth](#auth)
  - [Users](#users)
  - [Categories](#categories)
  - [Products](#products)
  - [Reviews](#reviews)
  - [Orders](#orders)
  - [Coupons](#coupons)
- [Query Features](#query-features)
- [Error Responses](#error-responses)
- [Security](#security)
- [Seeding Data](#seeding-data)

---

## Architecture

```
Backend/
├── config/          # DB connection, env loader
├── constants/       # roles, messages, enums
├── controllers/     # HTTP layer only — delegates to services/factory
│   └── handleFactory.js   # ← reusable CRUD (createOne, getOne, getAll, updateOne, deleteOne)
├── logs/            # Winston logger + daily-rotating files
├── middleware/       # auth, errorHandler, sanitize, security, setForeignKey, validate
├── models/          # Mongoose schemas with indexes, virtuals, hooks
├── routes/          # Modular routers — nested where needed (mergeParams)
├── services/        # All business logic — reusable, framework-agnostic
├── utils/           # AppError, catchAsync, APIFeatures, email, importData
├── validators/      # express-validator rule sets
├── data/            # JSON seed fixtures
├── app.js           # Express app wiring
└── server.js        # Entry point — DB connect → listen
```

### Layered flow

```
Request → Routes → Middleware (auth/validate/sanitize) → Controller (thin)
       → Service (business logic) → Model (data) → Response
```

---

## Tech Stack

| Concern            | Library                          |
|--------------------|----------------------------------|
| Framework          | Express 4                        |
| Database           | MongoDB via Mongoose 8           |
| Authentication     | JSON Web Tokens + bcryptjs       |
| Validation         | express-validator                |
| Security headers   | Helmet                           |
| Rate limiting      | express-rate-limit               |
| NoSQL sanitisation | express-mongo-sanitize           |
| XSS sanitisation   | xss                              |
| HPP prevention     | hpp                              |
| Logging            | Winston + winston-daily-rotate-file |
| HTTP logging       | Morgan                           |
| Email              | Nodemailer (Gmail SMTP)          |
| Compression        | compression                      |

---

## Getting Started

```bash
# 1. Install dependencies
cd Backend
npm install

# 2. Configure environment (edit config.env)
# 3. Start in development
npm run dev

# 4. Start in production
NODE_ENV=production npm start
```

The server listens on `http://localhost:5000` by default.

**Health check:**
```
GET /api/v1/health
```

---

## Environment Variables

Create / edit `Backend/config.env`:

```env
PORT=5000
NODE_ENV=development

# MongoDB
DATABASE_HOST=mongodb+srv://<user>:<db_password>@cluster.mongodb.net/dbname
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN_DAYS=7

# Admin bootstrap
ADMIN_SECRET=admin-portal-secret

# Gmail SMTP Configuration
# 1. Enable 2-Factor Authentication on your Gmail account
# 2. Generate an App Password: https://myaccount.google.com/apppasswords
# 3. Use your Gmail address as GMAIL_USER
# 4. Use the generated 16-character App Password as GMAIL_APP_PASSWORD
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
EMAIL_FROM="E-Commerce Store <your-email@gmail.com>"
OWNER_EMAIL=owner@gmail.com
# Optional: Additional staff emails (comma-separated)
# STAFF_EMAILS=staff1@gmail.com,staff2@gmail.com

# Cloudinary (optional — for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Response envelope

```json
{
  "status": "success | fail | error",
  "message": "Human-readable message",
  "data": { ... }
}
```

List responses additionally include:
```json
{
  "results": 10,
  "total": 150,
  "page": 1,
  "limit": 20
}
```

---

### Auth

| Method | Endpoint                        | Auth | Description                     |
|--------|---------------------------------|------|---------------------------------|
| POST   | `/auth/signup`                  | —    | Register a new user             |
| POST   | `/auth/login`                   | —    | Login, returns JWT              |
| POST   | `/auth/logout`                  | —    | Clears cookie token             |
| POST   | `/auth/forgotPassword`          | —    | Send password-reset email       |
| PATCH  | `/auth/resetPassword/:token`    | —    | Reset password using token      |
| PATCH  | `/auth/updateMyPassword`        | ✅   | Change password (logged-in)     |

**Signup body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

**Login body:**
```json
{ "email": "john@example.com", "password": "password123" }
```

---

### Users

| Method | Endpoint                        | Auth        | Roles               | Description              |
|--------|---------------------------------|-------------|---------------------|--------------------------|
| GET    | `/users/me`                     | ✅          | any                 | Get own profile          |
| PATCH  | `/users/updateMe`               | ✅          | any                 | Update name/email/photo  |
| DELETE | `/users/deleteMe`               | ✅          | any                 | Soft-delete own account  |
| GET    | `/users/wishlist`               | ✅          | any                 | Get wishlist             |
| POST   | `/users/wishlist`               | ✅          | any                 | Add product to wishlist  |
| DELETE | `/users/wishlist/:productId`    | ✅          | any                 | Remove from wishlist     |
| GET    | `/users`                        | ✅          | admin, super-admin  | List all users           |
| GET    | `/users/:id`                    | ✅          | admin, super-admin  | Get user by ID           |
| PATCH  | `/users/:id`                    | ✅          | admin, super-admin  | Update user              |
| DELETE | `/users/:id`                    | ✅          | admin, super-admin  | Delete user              |

---

### Categories

| Method | Endpoint              | Auth | Roles              | Description                    |
|--------|-----------------------|------|--------------------|--------------------------------|
| GET    | `/categories`         | —    | —                  | List all categories            |
| GET    | `/categories/tree`    | —    | —                  | Nested category tree           |
| GET    | `/categories/:id`     | —    | —                  | Get category + sub-categories  |
| POST   | `/categories`         | ✅   | admin, manager     | Create category                |
| PATCH  | `/categories/:id`     | ✅   | admin, manager     | Update category                |
| DELETE | `/categories/:id`     | ✅   | admin, super-admin | Delete category                |

---

### Products

| Method | Endpoint                | Auth | Roles              | Description                      |
|--------|-------------------------|------|--------------------|----------------------------------|
| GET    | `/products`             | —    | —                  | List products (full query support)|
| GET    | `/products/top-5`       | —    | —                  | Top 5 cheapest & best-rated       |
| GET    | `/products/featured`    | —    | —                  | Featured products                 |
| GET    | `/products/stats`       | ✅   | admin, manager     | Aggregation stats                 |
| GET    | `/products/:id`         | —    | —                  | Product detail + reviews          |
| POST   | `/products`             | ✅   | admin, manager     | Create product                    |
| PATCH  | `/products/:id`         | ✅   | admin, manager     | Update product                    |
| DELETE | `/products/:id`         | ✅   | admin, super-admin | Delete product                    |

**Category filter — slug OR ObjectId both work:**
```
GET /api/v1/products?category=electronics
GET /api/v1/products?category=6642f8c3a1b2c3d4e5f60001
```

---

### Reviews

| Method | Endpoint                                  | Auth | Roles       | Description               |
|--------|-------------------------------------------|------|-------------|---------------------------|
| GET    | `/reviews`                                | ✅   | any         | All reviews               |
| GET    | `/products/:productId/reviews`            | ✅   | any         | Reviews for a product     |
| POST   | `/products/:productId/reviews`            | ✅   | user        | Create review             |
| GET    | `/reviews/:id`                            | ✅   | any         | Get review                |
| PATCH  | `/reviews/:id`                            | ✅   | user, admin | Update review             |
| DELETE | `/reviews/:id`                            | ✅   | user, admin | Delete review             |

Rating average on the product is **auto-recalculated** after every create/update/delete via aggregation pipeline.

---

### Orders

| Method | Endpoint                     | Auth | Roles                     | Description            |
|--------|------------------------------|------|---------------------------|------------------------|
| POST   | `/orders`                    | ✅   | any                       | Create order           |
| GET    | `/orders`                    | ✅   | user→own / admin→all      | List orders            |
| GET    | `/orders/:id`                | ✅   | any                       | Get order              |
| PATCH  | `/orders/:id/deliver`        | ✅   | admin, manager            | Mark as delivered      |
| PATCH  | `/orders/:id/pay`            | ✅   | admin, manager            | Mark as paid           |
| GET    | `/orders/stats/overview`     | ✅   | admin, manager            | Order statistics       |
| PATCH  | `/orders/:id`                | ✅   | admin, manager            | Update order           |
| DELETE | `/orders/:id`                | ✅   | admin, super-admin        | Delete order           |

**Create order body:**
```json
{
  "orderItems": [
    { "product": "<productId>", "quantity": 2 }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "zip": "10001",
    "country": "US"
  },
  "paymentMethod": "card",
  "couponCode": "WELCOME10"
}
```

---

### Coupons

| Method | Endpoint               | Auth | Roles              | Description             |
|--------|------------------------|------|--------------------|-------------------------|
| POST   | `/coupons/validate`    | ✅   | any                | Pre-checkout validation |
| GET    | `/coupons`             | ✅   | admin, super-admin | List coupons            |
| POST   | `/coupons`             | ✅   | admin, super-admin | Create coupon           |
| GET    | `/coupons/:id`         | ✅   | admin, super-admin | Get coupon              |
| PATCH  | `/coupons/:id`         | ✅   | admin, super-admin | Update coupon           |
| DELETE | `/coupons/:id`         | ✅   | admin, super-admin | Delete coupon           |

---

## Query Features

All list endpoints support:

| Parameter | Example                          | Description              |
|-----------|----------------------------------|--------------------------|
| `filter`  | `?price[gte]=100&price[lte]=500` | Range filters            |
| `sort`    | `?sort=-price,ratingsAverage`    | Multi-field sort         |
| `fields`  | `?fields=name,price,imageCover`  | Field projection         |
| `page`    | `?page=2`                        | Pagination (default: 1)  |
| `limit`   | `?limit=10`                      | Page size (max: 100)     |

---

## Error Responses

| Status | Meaning                              |
|--------|--------------------------------------|
| 400    | Bad request / CastError              |
| 401    | Unauthenticated / bad token          |
| 403    | Forbidden (role check failed)        |
| 404    | Resource not found                   |
| 409    | Duplicate key conflict               |
| 422    | Validation failed                    |
| 429    | Rate limit exceeded                  |
| 500    | Internal server error                |

---

## Security

| Threat                  | Mitigation                              |
|-------------------------|-----------------------------------------|
| XSS                     | `xss` library on body/query/params      |
| NoSQL injection         | `express-mongo-sanitize`                |
| HTTP param pollution    | `hpp` whitelist                         |
| Brute-force login       | Auth route: 20 req / hour per IP        |
| General flooding        | Global: 300 req / 15 min per IP         |
| Insecure headers        | `helmet` with CSP                       |
| CSRF (cookie)           | `httpOnly + sameSite: strict` cookies   |
| Plaintext passwords     | bcryptjs cost factor 12                 |
| Token after pw change   | `changedPasswordAfter()` check on every protected request |

---

## Email Configuration

The system uses **Gmail SMTP** to send emails directly. See [GMAIL_SETUP.md](./GMAIL_SETUP.md) for detailed setup instructions.

### Email Features

1. **Welcome Email** - Automatically sent when a user signs up
2. **Password Reset Email** - Sent when a user requests password reset
3. **Contact Form Notifications** - Sent to owner and staff when someone submits the contact form

### Quick Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Update `config.env` with your Gmail credentials:
   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-char-app-password
   EMAIL_FROM="E-Commerce Store <your-email@gmail.com>"
   OWNER_EMAIL=owner@gmail.com
   ```

### Gmail Sending Limits

- Free Gmail: 500 emails/day
- Google Workspace: 2,000 emails/day

For higher volumes, consider SendGrid, AWS SES, or Mailgun.

---

## Seeding Data

```bash
# Import fixtures from Backend/data/*.json
npm run import-data

# Wipe all collections
npm run delete-data
```

Add your own JSON fixtures to `Backend/data/`:
- `categories.json`
- `users.json`
- `products.json`
- `reviews.json`
- `coupons.json`

---

## Roles

| Role         | Permissions                                  |
|--------------|----------------------------------------------|
| `user`       | Browse, purchase, review, manage own account |
| `manager`    | + manage products and categories             |
| `admin`      | + manage users and orders                    |
| `super-admin`| Full access including destructive deletes    |
