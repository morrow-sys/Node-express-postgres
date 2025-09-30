const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { uploadNewsImage } = require('../middlewares/upload');

// Получить все новости
router.get('/', newsController.getAllNews);

// Получить новость по ID
router.get('/:id', newsController.getNewsById);

// Создать новость
router.post('/', uploadNewsImage.single('image'), newsController.createNews);

// Обновить новость
router.put('/:id', uploadNewsImage.single('image'), newsController.updateNews);

// Удалить новость
router.delete('/:id', newsController.deleteNews);

module.exports = router;
