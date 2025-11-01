const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const pool = require('../../db');
const { isAuthenticated } = require('./auth');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Dashboard page
router.get('/dashboard', isAuthenticated, async (req, res) => {
  const [keywords] = await pool.query("SELECT * FROM keywords ORDER BY id DESC");
  res.render('dashboard', { user: req.session.user, keywords });
});

// Add keyword
router.get('/keywords/add', isAuthenticated, (req, res) => res.render('add'));
router.post('/keywords/add', isAuthenticated, upload.single('image'), async (req, res) => {
  const { keyword, reply_text } = req.body;
  const reply_image = req.file ? 'uploads/' + req.file.filename : null;
  await pool.query("INSERT INTO keywords (keyword, reply_text, reply_image) VALUES (?, ?, ?)", [keyword, reply_text, reply_image]);
  res.redirect('/dashboard');
});

// Edit keyword
router.get('/keywords/edit/:id', isAuthenticated, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM keywords WHERE id = ?", [req.params.id]);
  if (rows.length === 0) return res.redirect('/dashboard');
  res.render('edit', { keyword: rows[0] });
});

router.post('/keywords/edit/:id', isAuthenticated, upload.single('image'), async (req, res) => {
  const { keyword, reply_text, remove_image } = req.body;
  const [rows] = await pool.query("SELECT * FROM keywords WHERE id = ?", [req.params.id]);
  if (rows.length === 0) return res.redirect('/dashboard');

  let reply_image = rows[0].reply_image;

  if (remove_image === "1" && reply_image) fs.unlinkSync(path.join(__dirname, '..', 'public', reply_image));
  if (req.file) reply_image = 'uploads/' + req.file.filename;

  await pool.query("UPDATE keywords SET keyword=?, reply_text=?, reply_image=? WHERE id=?", [keyword, reply_text, reply_image, req.params.id]);
  res.redirect('/dashboard');
});

// Delete keyword
router.post('/keywords/delete/:id', isAuthenticated, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM keywords WHERE id = ?", [req.params.id]);
  if (rows.length > 0 && rows[0].reply_image) fs.unlinkSync(path.join(__dirname, '..', 'public', rows[0].reply_image));
  await pool.query("DELETE FROM keywords WHERE id=?", [req.params.id]);
  res.redirect('/dashboard');
});

module.exports = router;
