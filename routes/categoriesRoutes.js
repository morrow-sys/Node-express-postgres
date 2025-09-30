const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');

// Получить все категории
router.get('/', categoriesController.getAllCategories);

// Создать категорию
router.post('/', categoriesController.createCategory);

// Обновить категорию по ID
router.put('/:id', categoriesController.updateCategory);

// Удалить категорию по ID
router.delete('/:id', categoriesController.deleteCategory);

module.exports = router;
