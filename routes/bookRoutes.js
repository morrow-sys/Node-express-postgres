const express = require('express');
const router = express.Router();
const pool = require('../db/pool'); // импорт пула напрямую

// GET все книги
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении книг:', err);
    res.status(500).json({ error: 'Ошибка при получении книг' });
  }
});

// POST новая книга
router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Текст книги обязателен' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO books (text) VALUES ($1) RETURNING *',
      [text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при добавлении книги:', err);
    res.status(500).json({ error: 'Ошибка при добавлении книги' });
  }
});

// PUT обновление книги
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Текст книги обязателен' });
  }

  try {
    const result = await pool.query(
      'UPDATE books SET text = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [text, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при обновлении книги:', err);
    res.status(500).json({ error: 'Ошибка при обновлении книги' });
  }
});

// DELETE удаление книги
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM books WHERE id = $1', [id]);

    // Можно проверить, были ли удалены строки (result.rowCount)
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }

    res.sendStatus(204);
  } catch (err) {
    console.error('Ошибка при удалении книги:', err);
    res.status(500).json({ error: 'Ошибка при удалении книги' });
  }
});

module.exports = router;
