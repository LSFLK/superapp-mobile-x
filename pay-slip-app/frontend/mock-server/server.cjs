const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// --- Mock Data ---

let users = [
  { id: "user-1", email: "admin@example.com", role: "admin" },
  { id: "user-2", email: "user@example.com", role: "user" },
  { id: "user-3", email: "john.doe@example.com", role: "user" },
];

let paySlips = [
  {
    id: "ps-1",
    userId: "user-2",
    userEmail: "user@example.com",
    month: 1,
    year: 2024,
    fileUrl: "https://superappblobstrage.blob.core.windows.net/payslipcontainer/Sample%20Pay%20Sheet.pdf",
    uploadedBy: "user-1",
    createdAt: new Date("2024-01-31T10:00:00Z"),
    updatedAt: new Date("2024-01-31T10:00:00Z"),
  },
  {
    id: "ps-2",
    userId: "user-2",
    userEmail: "user@example.com",
    month: 2,
    year: 2024,
    fileUrl: "https://superappblobstrage.blob.core.windows.net/payslipcontainer/Sample%20Pay%20Sheet.pdf",
    uploadedBy: "user-1",
    createdAt: new Date("2024-02-29T10:00:00Z"),
    updatedAt: new Date("2024-02-29T10:00:00Z"),
  },
  // additional mock entries to exercise the user view
  {
    id: "ps-4",
    userId: "user-2",
    userEmail: "user@example.com",
    month: 2,
    year: 2026,
    fileUrl: "https://superappblobstrage.blob.core.windows.net/payslipcontainer/Sample%20Pay%20Sheet.pdf",
    uploadedBy: "user-1",
    createdAt: new Date("2026-02-26T00:00:00Z"),
    updatedAt: new Date("2026-02-26T00:00:00Z"),
  },
  {
    id: "ps-5",
    userId: "user-2",
    userEmail: "user@example.com",
    month: 1,
    year: 2026,
    fileUrl: "https://superappblobstrage.blob.core.windows.net/payslipcontainer/Sample%20Pay%20Sheet.pdf",
    uploadedBy: "user-1",
    createdAt: new Date("2026-02-01T00:00:00Z"),
    updatedAt: new Date("2026-02-01T00:00:00Z"),
  },
  {
    id: "ps-3",
    userId: "user-3",
    userEmail: "john.doe@example.com",
    month: 1,
    year: 2024,
    fileUrl: "https://superappblobstrage.blob.core.windows.net/payslipcontainer/Sample%20Pay%20Sheet.pdf",
    uploadedBy: "user-1",
    createdAt: new Date("2024-01-31T11:00:00Z"),
    updatedAt: new Date("2024-01-31T11:00:00Z"),
  },
];

// --- Middleware ---

// Simulates AuthMiddleware in Go backend
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // In dev mode, Go backend defaults to admin@example.com if no token (simplified)
    // Here we'll require it for consistency or pick a default.
    // Let's assume 'default-token' maps to admin@example.com
    req.user = users.find((u) => u.email === "admin@example.com");
    return next();
  }

  const token = authHeader.split(" ")[1];
  // Simple token mapping for mocking
  if (token === "admin-token") {
    req.user = users.find((u) => u.role === "admin");
  } else if (token === "user-token") {
    req.user = users.find((u) => u.id === "user-2");
  } else if (token === "john-token") {
    req.user = users.find((u) => u.id === "user-3");
  } else {
    return res.status(401).send("Invalid token");
  }
  next();
};

// --- Routes ---

// GET /api/me
app.get("/api/me", authMiddleware, (req, res) => {
  res.json(req.user);
});

// GET /api/users [Admin Only]
app.get("/api/users", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Forbidden");
  res.json(users);
});

// PUT /api/users/:id/role [Admin Only]
app.put("/api/users/:id/role", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Forbidden");
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).send("User not found");

  const { role } = req.body;
  if (role !== "admin" && role !== "user")
    return res.status(400).send("Invalid role");

  user.role = role;
  res.json({ message: "User role updated successfully" });
});

// GET /api/pay-slips
app.get("/api/pay-slips", authMiddleware, (req, res) => {
  const { limit, cursor } = req.query;
  const isAdmin = req.user.role === "admin";

  let filtered = paySlips;
  if (!isAdmin) {
    filtered = paySlips.filter((ps) => ps.userId === req.user.id);
  }

  // Basic pagination mock (no real cursor logic for simplicity)
  const pageSize = parseInt(limit) || 20;
  const data = filtered.slice(0, pageSize);

  res.json({
    data: data,
    total: filtered.length,
    nextCursor: null, // Simplified
  });
});

// GET /api/pay-slips/:id
app.get("/api/pay-slips/:id", authMiddleware, (req, res) => {
  const ps = paySlips.find((p) => p.id === req.params.id);
  if (!ps) return res.status(404).send("Pay slip not found");

  if (req.user.role !== "admin" && ps.userId !== req.user.id) {
    return res.status(403).send("Forbidden");
  }

  res.json(ps);
});

// GET /api/users/:id/pay-slips (used by admin detail view)
app.get("/api/users/:id/pay-slips", authMiddleware, (req, res) => {
  const { id } = req.params;
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).send("User not found");

  // only admin can fetch other users; regular users can only fetch their own
  if (req.user.role !== "admin" && req.user.id !== id) {
    return res.status(403).send("Forbidden");
  }

  const filtered = paySlips.filter((p) => p.userId === id);
  res.json({ data: filtered, total: filtered.length, nextCursor: null });
});

// POST /api/upload [Admin Only]
app.post("/api/upload", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Forbidden");
  // Mock file upload
  res.json({ fileUrl: "https://example.com/uploads/mock-file.pdf" });
});

// POST /api/pay-slips [Admin Only]
app.post("/api/pay-slips", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Forbidden");

  const { userId, month, year, fileUrl } = req.body;

  // Basic validation
  if (!userId || !month || !year || !fileUrl) {
    return res.status(400).send("Missing required fields");
  }

  const targetUser = users.find((u) => u.id === userId);
  if (!targetUser) return res.status(400).send("userId not found");

  const newSlip = {
    id: `ps-${paySlips.length + 1}`,
    userId,
    userEmail: targetUser.email,
    month,
    year,
    fileUrl,
    uploadedBy: req.user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  paySlips.push(newSlip);
  res.status(201).json(newSlip);
});

// DELETE /api/pay-slips/:id [Admin Only]
app.delete("/api/pay-slips/:id", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Forbidden");

  const index = paySlips.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).send("Pay slip not found");

  paySlips.splice(index, 1);
  res.sendStatus(204);
});

app.listen(port, () => {
  console.log(`Mock server listening at http://localhost:${port}`);
  console.log("Available tokens:");
  console.log("  Bearer admin-token -> admin@example.com (Admin)");
  console.log("  Bearer user-token  -> user@example.com (User)");
  console.log("  Bearer john-token  -> john.doe@example.com (User)");
});
