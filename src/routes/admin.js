// routes/admin.js
import express from "express";
import dotenv from "dotenv";
import User from "../models/User.js";

// make sure .env is loaded here too
dotenv.config();

const router = express.Router();

// Read admin emails
const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(",").map(e => e.trim())
  : [];

if (ADMIN_EMAILS.length === 0) {
  console.warn("⚠️ No admin emails found in .env");
} else {
  console.log("✅ Loaded admin emails:", ADMIN_EMAILS);
}

// Middleware: check if requester is an admin
const requireAdmin = (req, res, next) => {
  const email = req.headers["x-user-email"]; // frontend must send this header
  if (!email || !ADMIN_EMAILS.includes(email)) {
    return res.status(403).json({ error: "Access denied: Admins only" });
  }
  next();
};

// Admin: list all users
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Admin: toggle payment status
router.put("/users/:id/toggle-payment", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.hasPaid = !user.hasPaid;
    await user.save();

    res.json({ message: "Payment status updated", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update payment status" });
  }
});

export default router;
