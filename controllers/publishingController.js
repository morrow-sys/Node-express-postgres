const pool = require('../db/pool');

// Получить все публикации
const getAllPublishing = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM publishing_slider ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error in getAllPublishing:', err);
    res.status(500).json({ error: err.message });
  }
};

// Создать публикацию
const createPublishing = async (req, res) => {
  try {
    const { title, description, date } = req.body;

    // multer кладет файл в req.file
    const image = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/publishing/${req.file.filename}`
      : null;

    const result = await pool.query(
      'INSERT INTO publishing_slider (title, description, date, image) VALUES ($1,$2,$3,$4) RETURNING *',
      [title, description, date, image]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error in createPublishing:', err);
    res.status(500).json({ error: err.message });
  }
};

// Удалить публикацию
const deletePublishing = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM publishing_slider WHERE id=$1 RETURNING *',
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    res.json({ message: 'Slide deleted' });
  } catch (err) {
    console.error('Error in deletePublishing:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllPublishing,
  createPublishing,
  deletePublishing,
};
