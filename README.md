# CS543 Web Services · Tutorial 08: Node & Express Tutorial

## CampusEats Catalogue

A full-stack, lightweight menu catalogue web application developed for **CS543 Web Services Tutorial 08** at IIIT Vadodara.

### 📁 Project Structure

```text
Node-Express-Tutorial/
├── catalogue/
│   ├── server.js          # Express server with REST API routes & static file serving
│   ├── package.json       # Project dependencies and scripts
│   ├── test.js            # Automated test suite (9 test cases)
│   ├── README.md          # Detailed assignment documentation
│   └── public/
│       ├── index.html     # Frontend UI & Fetch API integration
│       └── style.css      # Custom styling matching reference design
├── package.json           # Root convenience runner
└── README.md              # Root repository overview
```

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

5. **Run test suite**:
   ```bash
   npm test
   ```

For detailed REST API documentation and manual curl testing examples, see [catalogue/README.md](catalogue/README.md).
