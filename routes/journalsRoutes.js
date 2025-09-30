const express = require('express');
const pool = require('../db/pool'); // Подключение к PostgreSQL
const router = express.Router();

// Получить список всех журналов
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, abbreviation, about, editorialBoard, indexing FROM journals ORDER BY name ASC'
    );
    res.send(result.rows);
  } catch (error) {
    console.error('Ошибка при получении списка журналов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить журнал по ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, name, abbreviation, about, editorialBoard, indexing FROM journals WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Журнал не найден' });
    }
    res.send(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при получении журнала:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить журнал по аббревиатуре
router.get('/by-abbreviation/:abbr', async (req, res) => {
  const abbr = req.params.abbr.toLowerCase();
  try {
    const result = await pool.query(
      'SELECT id, name, abbreviation, about, editorialBoard, indexing FROM journals WHERE LOWER(abbreviation) = $1',
      [abbr]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Журнал не найден' });
    }
    res.send(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при получении журнала:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавить новый журнал
router.post('/', async (req, res) => {
  const { name, abbreviation, about, editorialBoard, indexing } = req.body;

  if (!name || !abbreviation || !about || !editorialBoard) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO journals (name, abbreviation, about, editorialBoard, indexing)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, abbreviation, about, editorialBoard, indexing`,
      [name, abbreviation, about, editorialBoard, indexing || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при добавлении журнала:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить журнал по ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, abbreviation, about, editorialBoard, indexing } = req.body;

  if (!name || !abbreviation || !about || !editorialBoard) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }

  try {
    const result = await pool.query(
      `UPDATE journals
       SET name = $1,
           abbreviation = $2,
           about = $3,
           editorialBoard = $4,
           indexing = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING id, name, abbreviation, about, editorialBoard, indexing`,
      [name, abbreviation, about, editorialBoard, indexing || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Журнал не найден' });
    }

    res.send(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при обновлении журнала:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удалить журнал по ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM journals WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Журнал не найден' });
    }
    res.send({ message: 'Журнал удалён' }); 
  } catch (error) {
    console.error('Ошибка при удалении журнала:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
