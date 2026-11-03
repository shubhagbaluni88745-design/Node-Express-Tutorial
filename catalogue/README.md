# CampusEats Catalogue

A full-stack, lightweight menu catalogue web application developed for **CS543 Web Services (Tutorial 08)**.

The project demonstrates an end-to-end web architecture:
**Browser (HTML5, CSS3, Vanilla JS Fetch API)** &rarr; **REST API (Node.js + Express.js)** &rarr; **Data (In-memory storage)**.

---

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+ Fetch API, DOM manipulation)
- **Backend**: Node.js (v18+), Express.js (v5)
- **Architecture**: REST API with JSON payloads
- **Data Storage**: In-memory JavaScript array

---

## 📁 Project Structure

```text
catalogue/
├── server.js          # Express server with REST API routes & static file serving
├── package.json       # Project dependencies and npm scripts
├── test.js            # Automated test suite (9 test cases)
├── README.md          # Project documentation
└── public/
    ├── index.html     # Frontend user interface and client-side JavaScript
    └── style.css      # Custom stylesheet adhering to tutorial reference design
```

---

## 🚀 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- npm (installed automatically with Node.js)

### Step 1: Navigate to the Project Folder
Open your terminal and step into the `catalogue` directory:
```bash
cd catalogue
```

### Step 2: Install Dependencies
Install Express.js:
```bash
npm install
```

---

## 🖥️ Running the Application

### Start the Server
Run using npm:
```bash
npm start
```
Or directly using Node:
```bash
node server.js
```

The terminal will display:
```text
Catalogue on http://localhost:3000
```

### Open the Application
Open your browser and navigate to:
[http://localhost:3000](http://localhost:3000)

---

## 📡 REST API Documentation

Base URL: `http://localhost:3000`

### 1. `GET /items`
Retrieve the full list of dishes.

- **Method**: `GET`
- **URL**: `/items`
- **Response**: `200 OK`
- **Example Response Body**:
  ```json
  [
    { "id": 1, "name": "Veg Thali", "price": 90 },
    { "id": 2, "name": "Paneer Roll", "price": 70 }
  ]
  ```

---

### 2. `GET /items/:id`
Retrieve a specific dish by its unique numerical ID.

- **Method**: `GET`
- **URL**: `/items/:id` (e.g., `/items/1`)
- **Success Response**: `200 OK`
  ```json
  { "id": 1, "name": "Veg Thali", "price": 90 }
  ```
- **Error Response** (if item does not exist, e.g., `/items/99`): `404 Not Found`
  ```json
  { "error": "not found" }
  ```

---

### 3. `POST /items`
Create and append a new dish to the catalogue.

- **Method**: `POST`
- **URL**: `/items`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Masala Dosa",
    "price": 60
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": 3,
    "name": "Masala Dosa",
    "price": 60
  }
  ```
- **Validation Error Response** (if `name` is omitted or empty): `422 Unprocessable Entity`
  ```json
  { "error": "name required" }
  ```
- **Note on Price**: If `price` is omitted or invalid, it automatically defaults to `0`.

---

## 🧪 Testing

### 1. Automated Test Suite
An automated test runner is provided in `test.js` covering all 9 required test cases:

```bash
npm test
```
Or:
```bash
node test.js
```

#### Test Cases Covered:
1. **Test Case 1**: Server starts and binds to port 3000.
2. **Test Case 2**: Homepage loads with "CampusEats Catalogue", form, and dish container.
3. **Test Case 3**: `GET /items` returns the initial sample dishes (Veg Thali ₹90, Paneer Roll ₹70).
4. **Test Case 4**: `GET /items/1` returns the specific dish.
5. **Test Case 5**: `GET /items/99` returns HTTP 404 with `{"error":"not found"}`.
6. **Test Case 6**: `POST /items` adds a new dish with HTTP 201 Created and unique ID.
7. **Test Case 7**: `POST /items` with missing name returns HTTP 422 with `{"error":"name required"}`.
8. **Test Case 8**: Frontend integration: newly added dish is present in subsequent `GET /items`.
9. **Test Case 9**: Adding multiple dishes verifies sequential, unique IDs.

### 2. Manual Testing with cURL
You can also test the endpoints from your terminal using `curl`:

```bash
# List all dishes
curl http://localhost:3000/items

# Get dish with ID 1
curl http://localhost:3000/items/1

# Test 404 Not Found
curl -i http://localhost:3000/items/99

# Add a dish
curl -i -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Masala Dosa","price":60}'

# Test validation failure (missing name)
curl -i -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"price":60}'
```
