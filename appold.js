const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const keywordsRouter = require('./routes/keywords');

const app = express();

// DB Pool
app.locals.pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Udaya@882',
  database: 'botdb'
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.set('view engine', 'ejs');

// Routes
app.use('/', keywordsRouter);

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Admin Panel running at http://localhost:${PORT}`));
