const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware to read form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set EJS as the view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Routes
const authRoutes = require("./routes/auth");
const keywordRoutes = require("./routes/keywords");  // ✅ add keywords route

app.use("/auth", authRoutes);
app.use("/keywords", keywordRoutes);  // ✅ mount keywords route

// Dashboard route
app.get("/dashboard", (req, res) => {
  res.render("dashboard");  // ✅ load dashboard.ejs
});

// Default redirect
app.get("/", (req, res) => {
  res.redirect("/auth/login");
});

app.listen(PORT, () => {
  console.log(`✅ Admin panel running at http://localhost:${PORT}`);
});
