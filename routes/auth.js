const express = require("express");
const router = express.Router();

// Dummy admin credentials
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect("/auth/login");
}

// Login page
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Handle login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.user = { username };
    return res.redirect("/dashboard");
  }
  res.render("login", { error: "❌ Invalid username or password" });
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/auth/login"));
});

module.exports = { router, isAuthenticated };
