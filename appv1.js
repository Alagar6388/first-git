const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: "supersecret", resave: false, saveUninitialized: false }));
app.use("/public", express.static(path.join(__dirname, "public")));

// Views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes.router);

const dashboardRoutes = require("./routes/dashboard");
app.use("/", dashboardRoutes);

// Default redirect
app.get("/", (req, res) => res.redirect("/auth/login"));

app.listen(PORT, () => console.log(`✅ Admin panel running at http://localhost:${PORT}`));
