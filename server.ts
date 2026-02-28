import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("keramas.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category_id INTEGER,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT,
    cover_url TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    is_highlight INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('header_title', 'Keramas');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('ticker_text', 'Selamat datang di Keramas - Majalah Digital Kebanggaan Kita.');
  
  INSERT OR IGNORE INTO categories (name) VALUES ('Umum'), ('Berita'), ('Opini'), ('Sastra');
`);

const app = express();
const PORT = 3000;

app.use(express.json());

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "public/uploads");
    console.log("Multer destination:", uploadDir);
    if (!fs.existsSync(uploadDir)) {
      console.log("Creating upload directory...");
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log("Multer filename:", filename);
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Increase to 5MB for better UX
  fileFilter: (req, file, cb) => {
    console.log("Multer filtering file:", file.mimetype);
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

// Serve static files from public/uploads
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// API Routes
app.get("/api/settings", (req, res) => {
  try {
    const settings = db.prepare("SELECT * FROM settings").all();
    const settingsMap = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsMap);
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

app.post("/api/settings", (req, res) => {
  const { header_title, ticker_text } = req.body;
  try {
    if (header_title) {
      db.prepare("UPDATE settings SET value = ? WHERE key = 'header_title'").run(header_title);
    }
    if (ticker_text) {
      db.prepare("UPDATE settings SET value = ? WHERE key = 'ticker_text'").run(ticker_text);
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving settings:", err);
    res.status(500).json({ error: "Failed to save settings" });
  }
});

app.get("/api/categories", (req, res) => {
  try {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.post("/api/categories", (req, res) => {
  const { name } = req.body;
  try {
    const result = db.prepare("INSERT INTO categories (name) VALUES (?)").run(name);
    res.json({ id: result.lastInsertRowid, name });
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(400).json({ error: "Category already exists or invalid" });
  }
});

app.get("/api/content", (req, res) => {
  const { status } = req.query;
  try {
    let query = `
      SELECT c.*, cat.name as category_name 
      FROM content c 
      LEFT JOIN categories cat ON c.category_id = cat.id
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      query += " WHERE c.status = ?";
      params.push(status);
    } else if (!status) {
      query += " WHERE c.status = 'approved'";
    }

    query += " ORDER BY c.is_highlight DESC, c.created_at DESC";
    const content = db.prepare(query).all(...params);
    res.json(content);
  } catch (err) {
    console.error("Error fetching content:", err);
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

app.post("/api/content", (req, res) => {
  upload.single("cover")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      console.error("Unknown upload error:", err);
      return res.status(500).json({ error: err.message });
    }

    console.log("Received content submission body:", req.body);
    const { title, category_id, content, author_name, author_email } = req.body;
    const cover_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !category_id || !content || !author_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const result = db.prepare(`
        INSERT INTO content (title, category_id, content, author_name, author_email, cover_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(title, parseInt(category_id), content, author_name, author_email, cover_url);
      console.log("Content submitted successfully, ID:", result.lastInsertRowid);
      res.json({ id: result.lastInsertRowid });
    } catch (dbErr) {
      console.error("Database error during submission:", dbErr);
      res.status(500).json({ error: "Failed to save content to database" });
    }
  });
});

app.patch("/api/content/:id", (req, res) => {
  const { id } = req.params;
  const { status, is_highlight, title, content, category_id } = req.body;

  const updates: string[] = [];
  const params: any[] = [];

  if (status !== undefined) { updates.push("status = ?"); params.push(status); }
  if (is_highlight !== undefined) { 
    // If setting a new highlight, unset others
    if (is_highlight === 1) {
      db.prepare("UPDATE content SET is_highlight = 0").run();
    }
    updates.push("is_highlight = ?"); params.push(is_highlight); 
  }
  if (title !== undefined) { updates.push("title = ?"); params.push(title); }
  if (content !== undefined) { updates.push("content = ?"); params.push(content); }
  if (category_id !== undefined) { updates.push("category_id = ?"); params.push(category_id); }

  if (updates.length === 0) return res.status(400).json({ error: "No updates provided" });

  params.push(id);
  db.prepare(`UPDATE content SET ${updates.join(", ")} WHERE id = ?`).run(...params);
  res.json({ success: true });
});

app.delete("/api/content/:id", (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM content WHERE id = ?").run(id);
  res.json({ success: true });
});

// Catch-all for undefined API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
});

// Error handler for API routes
app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("API Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
