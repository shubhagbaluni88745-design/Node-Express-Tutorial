# CampusEats - Secured Catalogue

A production-grade, secure full-stack menu catalogue web application developed for **CS543 Web Services (Tutorial 08 & Tutorial 09: Securing the API)** at IIIT Vadodara.

This project upgrades the baseline REST service by adding:
1. **Password Hashing** via `bcryptjs` (salt rounds: 10).
2. **Stateless JWT Authentication** via `jsonwebtoken` (`POST /login` issuing signed Bearer tokens).
3. **Authentication Middleware (`auth`)** verifying signatures, headers, and expiration.
4. **Role-Based Access Control (`requireRole`)** enforcing permissions between `customer`, `restaurant`, and `admin` roles.
5. **Secure Frontend Session Management** with `sessionStorage`, dynamic role badges, and conditional form rendering.

---

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+ Fetch API, DOM manipulation, JWT client decoding, `sessionStorage`)
- **Backend**: Node.js (v18+), Express.js (v5)
- **Security & Cryptography**:
  - `bcryptjs`: One-way salted password hashing (10 rounds)
  - `jsonwebtoken` (JWT): Signed Bearer token authentication (HS256)
  - `dotenv`: Secure environment variable management
- **Architecture**: Role-Protected REST API with JSON payloads
- **Data Storage**: In-memory JavaScript array (seeded with sample users and dishes)

---

## 📁 Project Structure

```text
catalogue/
├── server.js          # Express server with JWT auth, role authorization & REST endpoints
├── package.json       # Project metadata, dependencies & npm scripts
├── package-lock.json  # Locked dependency tree
├── test.js            # Automated test suite (20 comprehensive test cases)
├── .env.example       # Template for environment variables
├── .env               # Active environment config (ignored in Git)
├── README.md          # Complete project documentation
├── postman/
│   └── CampusEats-Secured-API.postman_collection.json # Postman v2.1 collection
└── public/
    ├── index.html     # Frontend UI with authentication & role-based view
    └── style.css      # Custom stylesheet following reference design
```

---

## 🔐 Demonstration Credentials

Demo users are seeded with pre-hashed passwords at server initialization. **Plaintext passwords are never stored in memory or exposed in responses.**

| Name | Email | Password | Role | Permissions |
|------|-------|----------|------|-------------|
| **Asha** | `asha@campus.edu` | `customer123` | `customer` | View menu (`GET /items`, `GET /items/:id`) |
| **MealHub** | `mealhub@campus.edu` | `resto123` | `restaurant` | View menu + Add dishes (`POST /items`) |
| **Admin** | `admin@campus.edu` | `admin123` | `admin` | Full read and write access |

---

## ⚙️ Environment Configuration

The application reads runtime secrets from a local `.env` file via `dotenv`.

1. Copy the example configuration:
   ```bash
   cp .env.example .env
   ```
2. Configure `.env`:
   ```ini
   PORT=3000
   JWT_SECRET=your_super_secret_jwt_key_here
   ```
> **Security Note:** `.env` is listed in `.gitignore` and must never be committed to source control. If no `.env` is present, a development fallback secret is used for local demonstrations.

---

## 🚀 Installation & Startup

### 1. Install Dependencies
```bash
cd catalogue
npm install
```

### 2. Start the Server
```bash
npm start
```
*(Or directly: `node server.js`)*

The terminal will confirm:
```text
Secured Catalogue on http://localhost:3000
```

### 3. Open the Web Application
Open your browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

---

## 🔒 Security Architecture

### 1. Password Hashing (`bcryptjs`)
- Passwords are encrypted one-way using `bcrypt.hashSync(password, 10)` during server bootstrap.
- Verification uses `bcrypt.compareSync(password, user.hash)`.
- Hashes are never returned in login responses or API endpoints.

### 2. JWT Authentication Workflow (`POST /login`)
- The client submits credentials (`email`, `password`) in JSON format.
- The server validates credentials and signs a JWT:
  ```javascript
  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    SECRET,
    { expiresIn: '1h' }
  );
  ```
- The token expires after 1 hour (`expiresIn: '1h'`).
- The client stores the token in `sessionStorage` and attaches it to subsequent requests:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```

### 3. Authentication Middleware (`auth`)
- Intercepts requests to protected routes.
- Verifies format: `Authorization: Bearer <token>`.
- Validates token signature with `jwt.verify(token, SECRET)`.
- If missing, invalid, tampered, or expired, immediately halts with:
  ```json
  HTTP 401 Unauthorized
  { "error": "invalid or missing token" }
  ```
- On success, attaches payload to `req.user` and calls `next()`.

### 4. Role-Based Authorization Middleware (`requireRole`)
- Restricts endpoints based on user roles:
  ```javascript
  function requireRole(...allowed) {
    return (req, res, next) => {
      if (!req.user || !allowed.includes(req.user.role)) {
        return res.status(403).json({ error: 'forbidden' });
      }
      next();
    };
  }
  ```

### 5. HTTP 401 vs HTTP 403 Explained
- **HTTP 401 Unauthorized**: *"I do not know who you are."* The request lacks authentication or supplied an invalid/expired token.
- **HTTP 403 Forbidden**: *"I know who you are, but you are not allowed to perform this action."* The user is authenticated (e.g., as `customer`), but lacks permission to access the resource (e.g., `POST /items`).

---

## 📡 REST API Specification

### Summary of Endpoint Permissions

| Method | Path | Guard | Customer | Restaurant | Admin | Success Code |
|--------|------|-------|:--------:|:----------:|:-----:|:------------:|
| `POST` | `/login` | Public | Allowed | Allowed | Allowed | `200 OK` |
| `GET` | `/items` | `auth` | Allowed | Allowed | Allowed | `200 OK` |
| `GET` | `/items/:id` | `auth` | Allowed | Allowed | Allowed | `200 OK` |
| `POST` | `/items` | `auth` + `requireRole('restaurant','admin')` | **Denied (403)** | Allowed | Allowed | `201 Created` |

---

### Detailed Endpoints

#### 1. `POST /login`
Authenticates user and returns a signed JWT.
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "mealhub@campus.edu",
    "password": "resto123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error `401 Unauthorized`** (wrong password/email):
  ```json
  { "error": "bad login" }
  ```

---

#### 2. `GET /items`
Returns the full menu.
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Response `200 OK`**:
  ```json
  [
    { "id": 1, "name": "Veg Thali", "price": 90 },
    { "id": 2, "name": "Paneer Roll", "price": 70 }
  ]
  ```
- **Error `401 Unauthorized`** (no token):
  ```json
  { "error": "invalid or missing token" }
  ```

---

#### 3. `GET /items/:id`
Returns a single dish by numeric ID.
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Response `200 OK`**:
  ```json
  { "id": 1, "name": "Veg Thali", "price": 90 }
  ```
- **Error `404 Not Found`** (dish does not exist):
  ```json
  { "error": "not found" }
  ```

---

#### 4. `POST /items`
Adds a new dish to the catalogue (Restaurant or Admin only).
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <RESTAURANT_OR_ADMIN_TOKEN>`
- **Request Body**:
  ```json
  {
    "name": "Masala Dosa",
    "price": 60
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "id": 3,
    "name": "Masala Dosa",
    "price": 60
  }
  ```
- **Error `403 Forbidden`** (if token belongs to `customer`):
  ```json
  { "error": "forbidden" }
  ```
- **Error `422 Unprocessable Entity`** (if `name` is omitted):
  ```json
  { "error": "name required" }
  ```

---

## 🧪 Automated Testing

An automated test suite is located in `catalogue/test.js`.

### Run Tests:
```bash
npm test
```

### Coverage (20 Test Cases):
1. Server starts successfully on port 3000.
2. Homepage loads with all expected UI components.
3. Customer login succeeds (`asha@campus.edu` &rarr; role `customer`).
4. Restaurant login succeeds (`mealhub@campus.edu` &rarr; role `restaurant`).
5. Invalid login returns HTTP 401 `{"error":"bad login"}`.
6. `GET /items` without token returns HTTP 401.
7. `GET /items` with customer token returns HTTP 200.
8. `GET /items` with restaurant token returns HTTP 200.
9. `GET /items/1` with valid token returns dish.
10. `GET /items/99` returns HTTP 404.
11. Restaurant adds a dish (`POST /items` &rarr; HTTP 201).
12. Customer cannot add dish (`POST /items` &rarr; HTTP 403 Forbidden).
13. `POST /items` without token returns HTTP 401.
14. Missing dish name returns HTTP 422 `{"error":"name required"}`.
15. Invalid JWT returns HTTP 401.
16. Expired JWT returns HTTP 401.
17. Malformed Authorization headers return HTTP 401.
18. Modified/tampered JWT payload returns HTTP 401 (signature mismatch).
19. Privilege escalation attempt returns HTTP 401.
20. Newly created dishes receive sequential unique IDs.

---

## 📮 Postman Collection

The official collection is saved at:
[`catalogue/postman/CampusEats-Secured-API.postman_collection.json`](postman/CampusEats-Secured-API.postman_collection.json)

### Importing and Running:
1. Open Postman &rarr; Click **Import** &rarr; Select `CampusEats-Secured-API.postman_collection.json`.
2. The collection defines variables `baseUrl` (`http://localhost:3000`), `customerToken`, and `restaurantToken`.
3. Running request **1. Customer Login** automatically captures and sets `customerToken`.
4. Running request **2. Restaurant Login** automatically captures and sets `restaurantToken`.
5. All subsequent requests automatically use the captured tokens to verify status codes and role permissions.
