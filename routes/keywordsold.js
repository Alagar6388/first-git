const { isAuthenticated } = require('./auth');
router.use(isAuthenticated);   // protects all keyword routes
const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// ----------------- ROUTES -----------------

// 📋 List all keywords
router.get('/', async (req, res) => {
    const [rows] = await req.app.locals.pool.query("SELECT * FROM keywords ORDER BY id DESC");
    res.render('index', { keywords: rows });
});

// ➕ Add (form)
router.get('/add', (req, res) => {
    res.render('add');
});

// ➕ Add (submit)
router.post('/add', async (req, res) => {
    const { keyword, reply_text } = req.body;
    let reply_image = null;

    if (req.files && req.files.image) {
        const image = req.files.image;
        const uploadPath = path.join(__dirname, '../public/uploads', image.name);
        await image.mv(uploadPath);
        reply_image = 'uploads/' + image.name;
    }

    await req.app.locals.pool.query(
        "INSERT INTO keywords (keyword, reply_text, reply_image) VALUES (?, ?, ?)",
        [keyword, reply_text, reply_image]
    );

    res.redirect('/');
});

// ✏️ Edit (form)
router.get('/edit/:id', async (req, res) => {
    const [rows] = await req.app.locals.pool.query("SELECT * FROM keywords WHERE id=?", [req.params.id]);
    if (rows.length === 0) return res.redirect('/');
    res.render('edit', { keyword: rows[0] });
});

// ✏️ Edit (submit)
router.post('/edit/:id', async (req, res) => {
    const { keyword, reply_text, remove_image } = req.body;
    let reply_image = null;

    if (req.files && req.files.image) {
        const image = req.files.image;
        const uploadPath = path.join(__dirname, '../public/uploads', image.name);
        await image.mv(uploadPath);
        reply_image = 'uploads/' + image.name;
    }

    // Remove image if requested
    if (remove_image === "1") {
        await req.app.locals.pool.query(
            "UPDATE keywords SET keyword=?, reply_text=?, reply_image=NULL WHERE id=?",
            [keyword, reply_text, req.params.id]
        );
    } else if (reply_image) {
        await req.app.locals.pool.query(
            "UPDATE keywords SET keyword=?, reply_text=?, reply_image=? WHERE id=?",
            [keyword, reply_text, reply_image, req.params.id]
        );
    } else {
        await req.app.locals.pool.query(
            "UPDATE keywords SET keyword=?, reply_text=? WHERE id=?",
            [keyword, reply_text, req.params.id]
        );
    }

    res.redirect('/');
});

// 🗑 Delete
router.post('/delete/:id', async (req, res) => {
    // Optional: delete file if exists
    const [rows] = await req.app.locals.pool.query("SELECT reply_image FROM keywords WHERE id=?", [req.params.id]);
    if (rows.length > 0 && rows[0].reply_image) {
        const filePath = path.join(__dirname, '../public', rows[0].reply_image);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    await req.app.locals.pool.query("DELETE FROM keywords WHERE id=?", [req.params.id]);
    res.redirect('/');
});

// Export router
module.exports = router;
