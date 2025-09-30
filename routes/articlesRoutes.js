const express = require('express');
const router = express.Router();
const articlesController = require('../controllers/articlesController');
const { uploadArticleFile } = require('../middlewares/upload');

// Отдельная статья по ID (сначала конкретные маршруты!)
router.get('/by-journal/:journalAbbr/archive/:id', articlesController.getArticleById);

// Статьи конкретного выпуска (year + issueNumber)
router.get('/by-journal/:journalAbbr/:year/:issueNumber', articlesController.getArticlesByJournalAndIssue);

// Все статьи журнала
router.get('/by-journal/:journalAbbr', articlesController.getArticlesByJournal);

// Все статьи
router.get('/', articlesController.getAllArticles);

// Создать / обновить / удалить статьи
router.post('/', uploadArticleFile.single('pdfFile'), articlesController.createArticle);
router.put('/:id', uploadArticleFile.single('pdfFile'), articlesController.updateArticle);
router.delete('/:id', articlesController.deleteArticle);

module.exports = router;
