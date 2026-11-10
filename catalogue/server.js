// server.js -- the CampusEats Catalogue, now SECURED (Node + Express)
// CS543 Web Services: Tutorial 09 - Securing the API
// Authentication (JWT) + Role-Based Authorization on top of REST service.

require('dotenv').config();
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());                                   // read JSON request bodies
app.use(express.static(path.join(__dirname, 'public')));   // serve the web page

// Signing secret lives in environment variables, never hardcoded in production
const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Seed demonstration users -- passwords are hashed using bcrypt (10 salt rounds) at startup
const users = [
  { id: 1, email: 'asha@campus.edu',    role: 'customer',   hash: bcrypt.hashSync('customer123', 10) },
  { id: 2, email: 'mealhub@campus.edu', role: 'restaurant', hash: bcrypt.hashSync('resto123', 10)    },
  { id: 3, email: 'admin@campus.edu',   role: 'admin',      hash: bcrypt.hashSync('admin123', 10)    },
];

// In-memory items array (initial menu)
let items = [
  { id: 1, name: 'Veg Thali',   price: 90 },
  { id: 2, name: 'Paneer Roll', price: 70 },
];
let nextId = 3;

// POST /login -- verify credentials with bcrypt and return a signed JWT
app.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(401).json({ error: 'bad login' });
  }

  const user = users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.hash)) {
    return res.status(401).json({ error: 'bad login' });
  }

  // Token carries identity (sub) and role (role); expires in 1 hour
  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    SECRET,
    { expiresIn: '1h' }
  );
  res.json({ token });
});

// Authentication middleware -- WHO are you? (verify token, else 401)
function auth(req, res, next) {
  const authHeader = req.get('Authorization') || '';
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return res.status(401).json({ error: 'invalid or missing token' });
  }

  const token = parts[1];
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'invalid or missing token' });
  }
}

// Authorization middleware -- are you ALLOWED? (check role, else 403)
function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    next();
  };
}

// GET /items -- any authenticated user may read the full menu
app.get('/items', auth, (req, res) => {
  res.json(items);
});

// GET /items/:id -- any authenticated user may read an individual dish by ID
app.get('/items/:id', auth, (req, res) => {
  const item = items.find(i => i.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'not found' });
  res.json(item);
});

// POST /items -- only a restaurant or admin may add a dish
app.post('/items', auth, requireRole('restaurant', 'admin'), (req, res) => {
  const { name, price } = req.body || {};
  if (!name || (typeof name === 'string' && !name.trim())) {
    return res.status(422).json({ error: 'name required' });
  }

  const item = {
    id: nextId++,
    name: typeof name === 'string' ? name.trim() : name,
    price: Number(price) || 0,
  };
  items.push(item);
  res.status(201).json(item);
});

const PORT = process.env.PORT || 3000;
let serverInstance = null;

if (require.main === module) {
  serverInstance = app.listen(PORT, () => console.log(`Secured Catalogue on http://localhost:${PORT}`));
}

module.exports = app;
module.exports.SECRET = SECRET;
module.exports.users = users;
module.exports.startServer = (port = PORT) => {
  if (!serverInstance) {
    serverInstance = app.listen(port);
  }
  return serverInstance;
};
module.exports.closeServer = (done) => {
  if (serverInstance) {
    serverInstance.close(done);
    serverInstance = null;
  } else if (done) {
    done();
  }
};
module.exports.resetState = () => {
  items = [
    { id: 1, name: 'Veg Thali',   price: 90 },
    { id: 2, name: 'Paneer Roll', price: 70 },
  ];
  nextId = 3;
};
