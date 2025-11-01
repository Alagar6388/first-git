const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { isAuthenticated } = require('./auth');

// Storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// In-memory keywords
let keywords = [];
let idCounter = 1;

// Dashboard
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.session.user, keywords });
});

// Add Keyword form
router.get('/keywords/add', isAuthenticated, (req, res) => {
  res.render('add');
});

// Handle Add Keyword
router.post('/keywords/add', isAuthenticated, upload.single('image'), (req, res) => {
  const { keyword, reply_text } = req.body;
  const reply_image = req.file ? 'uploads/' + req.file.filename : null;
  keywords.push({ id: idCounter++, keyword, reply_text, reply_image });
  res.redirect('/dashboard');
});

// Edit form
router.get('/keywords/edit/:id', isAuthenticated, (req, res) => {
  const k = keywords.find(k => k.id == req.params.id);
  if (!k) return res.redirect('/dashboard');
  res.render('edit', { keyword: k });
});

// Handle Edit
router.post('/keywords/edit/:id', isAuthenticated, upload.single('image'), (req, res) => {
  const k = keywords.find(k => k.id == req.params.id);
  if (!k) return res.redirect('/dashboard');

  k.keyword = req.body.keyword;
  k.reply_text = req.body.reply_text;

  if (req.body.remove_image && k.reply_image) {
    fs.unlinkSync(path.join(__dirname, '..', k.reply_image));
    k.reply_image = null;
  }

  if (req.file) k.reply_image = 'uploads/' + req.file.filename;

  res.redirect('/dashboard');
});

// Delete
router.post('/keywords/delete/:id', isAuthenticated, (req, res) => {
  keywords = keywords.filter(k => k.id != req.params.id);
  res.redirect('/dashboard');
});

module.exports = router;
