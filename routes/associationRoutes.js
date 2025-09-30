const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET — все ассоциации
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM associations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении ассоциаций:', err);
    res.status(500).json({ error: 'Ошибка при получении ассоциаций' });
  }
});

// POST — создать новую ассоциацию
router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Текст ассоциации обязателен' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO associations (text) VALUES ($1) RETURNING *',
      [text.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при добавлении ассоциации:', err);
    res.status(500).json({ error: 'Ошибка при добавлении ассоциации' });
  }
});

// PUT — обновить ассоциацию
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Текст ассоциации обязателен' });
  }

  try {
    const result = await pool.query(
      'UPDATE associations SET text = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [text.trim(), id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ассоциация не найдена' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при обновлении ассоциации:', err);
    res.status(500).json({ error: 'Ошибка при обновлении ассоциации' });
  }
});

// DELETE — удалить ассоциацию
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM associations WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ассоциация не найдена' });
    }
    res.sendStatus(204);
  } catch (err) {
    console.error('Ошибка при удалении ассоциации:', err);
    res.status(500).json({ error: 'Ошибка при удалении ассоциации' });
  }
});

module.exports = router;
