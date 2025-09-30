// routes/authorRoutes.js
const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');
const { uploadAuthorFile } = require('../middlewares/upload');

router.get('/', authorController.getAllAuthorFiles);
router.post('/', uploadAuthorFile.single('file'), authorController.createAuthorFile);
router.patch('/:id', authorController.updateAuthorFile);
router.delete('/:id', authorController.deleteAuthorFile);
router.patch('/order', authorController.updateOrderAuthorFiles);

module.exports = router;
