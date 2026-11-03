// server.js -- the CampusEats Catalogue REST API (Node + Express)
const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());                               // read JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // serve the web page

// the menu -- in memory for now (a real database comes in Lecture 10)
let items = [
  { id: 1, name: 'Veg Thali',   price: 90 },
  { id: 2, name: 'Paneer Roll', price: 70 },
];
let nextId = 3;

// GET /items  -- list the whole menu
app.get('/items', (req, res) => {
  res.json(items);
});

// GET /items/:id  -- one dish, or 404
app.get('/items/:id', (req, res) => {
  const item = items.find(i => i.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'not found' });
  res.json(item);
});

// POST /items  -- add a dish
app.post('/items', (req, res) => {
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

const PORT = 3000;
app.listen(PORT, () => console.log(`Catalogue on http://localhost:${PORT}`));

module.exports = app;
