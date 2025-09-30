const express = require('express');
const router = express.Router();
const publishingController = require('../controllers/publishingController');
const { uploadPublishingImage } = require('../middlewares/upload');

// Получить все публикации
router.get('/', publishingController.getAllPublishing);

// Создать новую публикацию с изображением
router.post('/', uploadPublishingImage.single('image'), publishingController.createPublishing);

// Удалить публикацию
router.delete('/:id', publishingController.deletePublishing);

module.exports = router;
