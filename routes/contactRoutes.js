const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/contact');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// GET
router.get('/', contactController.getContact);

// PUT с мультером
router.put('/', upload.array('images'), contactController.updateContact);

// DELETE изображения
router.delete('/image/:imageName', contactController.deleteContactImage);

module.exports = router;

