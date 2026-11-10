# CS543 Web Services · Tutorial 09: Securing the API

## CampusEats Catalogue (Secured)

A full-stack, secure menu catalogue web application developed for **CS543 Web Services** at IIIT Vadodara.

This project enhances the Tutorial 08 baseline with:
- **bcrypt Password Hashing** (10 salt rounds)
- **JWT Authentication** (`POST /login` with 1-hour expiration)
- **Authentication Middleware (`auth`)**
- **Role-Based Authorization Middleware (`requireRole`)**
- **Protected REST API Endpoints**
- **Authenticated Vanilla JS Frontend** with dynamic role badges and session management
- **Postman Collection (v2.1)** and 20 automated tests

---

### 📁 Project Structure

```text
Node-Express-Tutorial/
├── catalogue/
│   ├── server.js          # Express server with JWT auth, role rules & static file serving
│   ├── package.json       # Project dependencies (express, jsonwebtoken, bcryptjs, dotenv)
│   ├── package-lock.json  # Dependency lockfile
│   ├── test.js            # Automated test suite (20 test cases)
│   ├── .env.example       # Template for environment configuration
│   ├── .env               # Active environment file (git-ignored)
│   ├── README.md          # Comprehensive assignment documentation
│   ├── postman/
│   │   └── CampusEats-Secured-API.postman_collection.json # Postman test collection
│   └── public/
│       ├── index.html     # Secure frontend interface with login & role-based UI
│       └── style.css      # Custom styling matching tutorial specifications
├── package.json           # Root convenience script runner
├── .gitignore             # Git ignore file excluding node_modules and .env
└── README.md              # Root repository overview
```

---

### 🔑 Demo Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Customer** | `asha@campus.edu` | `customer123` | Read-only access to menu |
| **Restaurant** | `mealhub@campus.edu` | `resto123` | Read menu + Add new dishes |
| **Admin** | `admin@campus.edu` | `admin123` | Read menu + Add new dishes |

---

### 🚀 Quick Start

1. **Step into the project directory**:
   ```bash
   cd catalogue
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open in browser**:
   Visit [http://localhost:3000](http://localhost:3000)

5. **Run the 20-test automated verification suite**:
   ```bash
   npm test
   ```

For detailed API documentation, security mechanisms, and Postman setup, refer to [catalogue/README.md](catalogue/README.md).
