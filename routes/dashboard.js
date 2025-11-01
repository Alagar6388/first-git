const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const pool = require('../../db'); // database
const { isAuthenticated } = require('./auth'); // ensure you have this middleware

// Multer setup for images and attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'image') {
      cb(null, 'public/uploads/images');
    } else if (file.fieldname === 'attachment') {
      cb(null, 'public/uploads/attachments');
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// List all keywords
router.get('/', isAuthenticated, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM keywords ORDER BY id DESC");
  res.render('dashboard', { keywords: rows, user: req.session.user });
});

// Add keyword form
router.get('/add', isAuthenticated, (req, res) => {
  res.render('add');
});

// Handle add keyword
router.post('/add', isAuthenticated, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'attachment', maxCount: 1 }
]), async (req, res) => {
  const { keyword, reply_text } = req.body;
  const reply_image = req.files['image'] ? 'uploads/images/' + req.files['image'][0].filename : null;
  const attachment_file = req.files['attachment'] ? 'uploads/attachments/' + req.files['attachment'][0].filename : null;

  await pool.query(
    "INSERT INTO keywords (keyword, reply_text, reply_image, attachment_file) VALUES (?, ?, ?, ?)",
    [keyword, reply_text, reply_image, attachment_file]
  );

  res.redirect('/dashboard');
});

// Edit keyword form
router.get('/edit/:id', isAuthenticated, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM keywords WHERE id = ?", [req.params.id]);
  if (rows.length === 0) return res.redirect('/dashboard');
  res.render('edit', { keyword: rows[0] });
});

// Handle edit keyword
router.post('/edit/:id', isAuthenticated, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'attachment', maxCount: 1 }
]), async (req, res) => {
  const { keyword, reply_text, remove_image, remove_attachment } = req.body;

  const [rows] = await pool.query("SELECT * FROM keywords WHERE id = ?", [req.params.id]);
  if (rows.length === 0) return res.redirect('/dashboard');

  let reply_image = rows[0].reply_image;
  let attachment_file = rows[0].attachment_file;

  // Remove image if requested
  if (remove_image === "1" && reply_image) {
    fs.unlinkSync(path.join(__dirname, '..', 'public', reply_image));
    reply_image = null;
  }

  // Remove attachment if requested
  if (remove_attachment === "1" && attachment_file) {
    fs.unlinkSync(path.join(__dirname, '..', 'public', attachment_file));
    attachment_file = null;
  }

  // Update with new uploaded files
  if (req.files['image']) reply_image = 'uploads/images/' + req.files['image'][0].filename;
  if (req.files['attachment']) attachment_file = 'uploads/attachments/' + req.files['attachment'][0].filename;

  await pool.query(
    "UPDATE keywords SET keyword = ?, reply_text = ?, reply_image = ?, attachment_file = ? WHERE id = ?",
    [keyword, reply_text, reply_image, attachment_file, req.params.id]
  );

  res.redirect('/dashboard');
});

// Delete keyword
router.post('/delete/:id', isAuthenticated, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM keywords WHERE id = ?", [req.params.id]);
  if (rows.length > 0) {
    if (rows[0].reply_image) fs.unlinkSync(path.join(__dirname, '..', 'public', rows[0].reply_image));
    if (rows[0].attachment_file) fs.unlinkSync(path.join(__dirname, '..', 'public', rows[0].attachment_file));
  }

  await pool.query("DELETE FROM keywords WHERE id = ?", [req.params.id]);
  res.redirect('/dashboard');
});

module.exports = router;
