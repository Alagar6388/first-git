const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Middleware to protect routes
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect("/auth/login");
}

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

let keywords = [];
let idCounter = 1;

// List
router.get("/", isAuthenticated, (req, res) => {
  res.render("keywords", { keywords });
});

// Add
router.get("/add", isAuthenticated, (req, res) => {
  res.render("add");
});

router.post("/add", isAuthenticated, upload.single("image"), (req, res) => {
  const { keyword, reply_text } = req.body;
  const reply_image = req.file ? "uploads/" + req.file.filename : null;
  keywords.push({ id: idCounter++, keyword, reply_text, reply_image });
  res.redirect("/keywords");
});

// Edit
router.get("/edit/:id", isAuthenticated, (req, res) => {
  const keyword = keywords.find(k => k.id == req.params.id);
  if (!keyword) return res.redirect("/keywords");
  res.render("edit", { keyword });
});

router.post("/edit/:id", isAuthenticated, upload.single("image"), (req, res) => {
  const keyword = keywords.find(k => k.id == req.params.id);
  if (!keyword) return res.redirect("/keywords");

  keyword.keyword = req.body.keyword;
  keyword.reply_text = req.body.reply_text;

  if (req.body.remove_image && keyword.reply_image) {
    fs.unlinkSync(path.join(__dirname, "..", keyword.reply_image));
    keyword.reply_image = null;
  }

  if (req.file) {
    keyword.reply_image = "uploads/" + req.file.filename;
  }

  res.redirect("/keywords");
});

// Delete
router.post("/delete/:id", isAuthenticated, (req, res) => {
  keywords = keywords.filter(k => k.id != req.params.id);
  res.redirect("/keywords");
});

module.exports = router;
