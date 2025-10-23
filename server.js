import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import pool from "./db.js";

// list all products
// Invoke-RestMethod -Uri "http://localhost:3000/api/products"

// creating 
// Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method POST -Body '{"name":"Lemonade","price":4.99,"description":"refreshing drink"}' -ContentType "application/json"


// delete product by id
// Invoke-WebRequest -Uri "http://localhost:3000/api/products/3" -Method DELETE



const app = express();
app.use(cors());
app.use(express.json());

// ✅ Test the database connection
app.get("/api/test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS time");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Signup new user
app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await pool.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hash]);
  res.json({ message: "User created successfully" });
});

// ✅ Login user
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  const user = users[0];
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({ message: "Login successful", user });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// ✅ Get all products
app.get("/api/products", async (_, res) => {
  const [rows] = await pool.query("SELECT * FROM products");
  res.json(rows);
});

// ✅ Add product (for testing)
app.post("/api/products", async (req, res) => {
  const { name, price, description } = req.body;
  await pool.query("INSERT INTO products (name, price, description) VALUES (?, ?, ?)", [name, price, description]);
  res.json({ message: "Product added" });
});

// ✅ Delete product by ID
app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: `Product ${id} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Update product by ID
app.put("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, description } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?",
      [name, price, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: `Product ${id} updated successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve your frontend files from the "client" folder
app.use(express.static(path.join(__dirname, "../client")));


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
