// server.js
import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import { nanoid } from "nanoid";

const app = express();
const db = new Database("storage.db");

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Tables
const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS storage_items (
      id TEXT PRIMARY KEY,
      name TEXT,
      location TEXT,
      quantity INTEGER
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      title TEXT,
      status TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      orderId TEXT,
      name TEXT,
      location TEXT,
      quantity INTEGER,
      found INTEGER DEFAULT 0,
      FOREIGN KEY (orderId) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS template_items (
      id TEXT PRIMARY KEY,
      templateId TEXT,
      name TEXT,
      location TEXT,
      quantity INTEGER,
      FOREIGN KEY (templateId) REFERENCES templates(id)
    );
  `);
};

initDb();

// ---- Storage Items ----
app.get("/storage", (req, res) => {
  const items = db.prepare("SELECT * FROM storage_items ORDER BY name COLLATE NOCASE ASC").all();
  res.json(items);
});

app.post("/storage", (req, res) => {
  const { name, location, quantity } = req.body;
  const id = nanoid();
  db.prepare("INSERT INTO storage_items (id, name, location, quantity) VALUES (?, ?, ?, ?)")
    .run(id, name, location, quantity);
  res.json({ id });
});

app.delete("/storage/:id", (req, res) => {
  db.prepare("DELETE FROM storage_items WHERE id = ?").run(req.params.id);
  res.json({ status: "deleted" });
});

// ---- Templates ----
app.get("/templates", (req, res) => {
  const templates = db.prepare("SELECT * FROM templates").all();
  for (const template of templates) {
    template.items = db.prepare("SELECT * FROM template_items WHERE templateId = ?").all(template.id);
  }
  res.json(templates);
});

app.post("/templates", (req, res) => {
  const { name, description } = req.body;
  const id = nanoid();
  db.prepare("INSERT INTO templates (id, name, description) VALUES (?, ?, ?)").run(id, name, description);
  res.json({ id });
});

app.put("/templates/:id", (req, res) => {
  const { name, description } = req.body;
  db.prepare("UPDATE templates SET name = ?, description = ? WHERE id = ?").run(name, description, req.params.id);
  res.json({ status: "updated" });
});

app.delete("/templates/:id", (req, res) => {
  db.prepare("DELETE FROM template_items WHERE templateId = ?").run(req.params.id);
  db.prepare("DELETE FROM templates WHERE id = ?").run(req.params.id);
  res.json({ status: "deleted" });
});

app.post("/templates/:id/items", (req, res) => {
  const { name, location, quantity } = req.body;
  const id = nanoid();
  db.prepare("INSERT INTO template_items (id, templateId, name, location, quantity) VALUES (?, ?, ?, ?, ?)")
    .run(id, req.params.id, name, location, quantity);
  res.json({ id });
});

app.delete("/templates/:templateId/items/:itemId", (req, res) => {
  db.prepare("DELETE FROM template_items WHERE id = ?").run(req.params.itemId);
  res.json({ status: "deleted" });
});

// ---- Orders ----
app.get("/orders", (req, res) => {
  const orders = db.prepare("SELECT * FROM orders").all();
  for (const order of orders) {
    order.items = db.prepare("SELECT * FROM order_items WHERE orderId = ?").all(order.id);
  }
  res.json(orders);
});

app.post("/orders", (req, res) => {
  const { title, items, status = "pending", createdAt = new Date().toISOString() } = req.body;
  const id = nanoid();
  db.prepare("INSERT INTO orders (id, title, status, createdAt) VALUES (?, ?, ?, ?)")
    .run(id, title, status, createdAt);

  const insertItem = db.prepare("INSERT INTO order_items (id, orderId, name, location, quantity, found) VALUES (?, ?, ?, ?, ?, ?)");
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insertItem.run(nanoid(), id, item.name, item.location, item.quantity, 0);
    }
  });

  insertMany(items);

  res.json({ id });
});

app.put("/orders/:id/status", (req, res) => {
  const { status } = req.body;
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ status: "updated" });
});

// ---- Completed Items ----
app.get("/completed-items", (req, res) => {
  const completed = db.prepare("SELECT * FROM order_items WHERE found = 1").all();
  res.json(completed);
});

app.post("/orders/:id/complete", (req, res) => {
  db.prepare("UPDATE orders SET status = 'completed' WHERE id = ?").run(req.params.id);
  db.prepare("UPDATE order_items SET found = 1 WHERE orderId = ?").run(req.params.id);
  res.json({ status: "completed" });
});

app.listen(3001, () => console.log("API running on http://localhost:3001"));
