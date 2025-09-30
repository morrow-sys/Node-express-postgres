require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const initTables = require('./db/initTables');

const newsRoutes = require('./routes/newsRoutes');
const publishingRoutes = require('./routes/publishingRoutes');
const authorRoutes = require('./routes/authorRoutes');
const authRoutes = require('./routes/authRoutes');
const journalsRoutes = require('./routes/journalsRoutes');
const booksRoutes = require('./routes/bookRoutes');
const associationRoutes = require('./routes/associationRoutes');
const articlesRoutes = require('./routes/articlesRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Создание папок uploads, если их нет ---
['uploads/news', 'uploads/publishing', 'uploads/authors', 'uploads/articles'].forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Created folder: ${fullPath}`);
  }
});

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Инициализация таблиц в БД ---
initTables();

// --- Маршруты ---
app.use('/api/news', newsRoutes);
app.use('/api/publishingslider', publishingRoutes);
app.use('/api/author-files', authorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/journals', journalsRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/associations', associationRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/contact', contactRoutes);


// --- Статика для uploads ---
app.use('/uploads/news', express.static(path.join(__dirname, 'uploads', 'news')));
app.use('/uploads/publishing', express.static(path.join(__dirname, 'uploads', 'publishing')));
app.use('/uploads/authors', express.static(path.join(__dirname, 'uploads', 'authors')));
app.use('/uploads/articles', express.static(path.join(__dirname, 'uploads', 'articles')));
app.use('/uploads/contact', express.static(path.join(__dirname, 'uploads', 'contact')));

// --- Запуск сервера ---
app.listen(PORT, '0.0.0.0',() => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
