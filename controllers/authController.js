const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../db/pool');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = '8h';

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Имя пользователя и пароль обязательны' });
  }

  try {
    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
    }

    const admin = result.rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);

    if (!match) {
      return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
    }

    const payload = { id: admin.id, username: admin.username, role: admin.role || 'admin' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({ token, username: admin.username, role: payload.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}

module.exports = { login };
