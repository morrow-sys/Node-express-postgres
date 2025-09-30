const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// POST /api/auth/login
router.post('/login', login);

// Убираем /dashboard, потому что фронтенд не использует его
// Если понадобится защищённый API маршрут для админки, добавляйте конкретно под нужды, например:
router.get('/me', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.json({ username: req.user.username, role: req.user.role });
});

module.exports = router;
