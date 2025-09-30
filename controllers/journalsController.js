const pool = require('../db/pool');

// Получить все журналы
const getAllJournals = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM journals ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить журнал по имени
const getJournalByName = async (req, res) => {
  const { name } = req.params;
  try {
    const result = await pool.query('SELECT * FROM journals WHERE name = $1', [name]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Журнал не найден' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создать новый журнал
const createJournal = async (req, res) => {
  const { name, abbreviation, about, editorialBoard, indexing } = req.body;
  try {
    const existing = await pool.query('SELECT 1 FROM journals WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Журнал с таким именем уже существует' });
    }
    const result = await pool.query(
      `INSERT INTO journals (name, abbreviation, about, editorialBoard, indexing) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, abbreviation, about, editorialBoard, indexing]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить журнал
const updateJournal = async (req, res) => {
  const { name } = req.params;
  const { abbreviation, about, editorialBoard, indexing } = req.body;
  try {
    const result = await pool.query(
      `UPDATE journals 
       SET abbreviation = $1, about = $2, editorialBoard = $3, indexing = $4, updated_at = NOW() 
       WHERE name = $5 RETURNING *`,
      [abbreviation, about, editorialBoard, indexing, name]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Журнал не найден' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удалить журнал
const deleteJournal = async (req, res) => {
  const { name } = req.params;
  try {
    const result = await pool.query('DELETE FROM journals WHERE name = $1 RETURNING *', [name]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Журнал не найден' });
    }
    res.json({ message: 'Журнал удалён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getAllJournals,
  getJournalByName,
  createJournal,
  updateJournal,
  deleteJournal,
};
