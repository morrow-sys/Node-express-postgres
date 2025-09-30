require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./db/pool');

const admins = [
  { username: process.env.ADMIN1_USERNAME, plainPassword: process.env.ADMIN1_PASSWORD, role: process.env.ADMIN1_ROLE || 'admin' },
  { username: process.env.ADMIN2_USERNAME, plainPassword: process.env.ADMIN2_PASSWORD, role: process.env.ADMIN2_ROLE || 'editor' },
];

const createAdmins = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin'
      );
    `);

    for (const { username, plainPassword, role } of admins) {
      if (!username || !plainPassword) {
        console.log(`❌ Пропущен админ с username="${username}"`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const existing = await pool.query(`SELECT * FROM admins WHERE username = $1`, [username]);
      if (existing.rows.length > 0) {
        console.log(`❌ Пользователь "${username}" уже существует`);
        continue;
      }

      await pool.query(
        `INSERT INTO admins (username, password_hash, role) VALUES ($1, $2, $3)`,
        [username, hashedPassword, role || 'admin']
      );

      console.log(`✅ Пользователь "${username}" успешно создан`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Ошибка создания пользователей:', err);
    process.exit(1);
  }
};

createAdmins();
