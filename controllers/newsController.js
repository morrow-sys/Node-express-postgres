const pool = require('../db/pool');

// ================== GET ALL NEWS ==================
exports.getAllNews = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM news ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get news error:', err);
    res.status(500).json({ error: 'Ошибка при получении новостей' });
  }
};

// ================== GET NEWS BY ID ==================
exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM news WHERE id=$1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get news by ID error:', err);
    res.status(500).json({ error: 'Ошибка при получении новости' });
  }
};

// ================== CREATE NEWS ==================
exports.createNews = async (req, res) => {
  try {
    const title = typeof req.body.title === 'string' ? JSON.parse(req.body.title) : req.body.title;
    const description = typeof req.body.description === 'string' ? JSON.parse(req.body.description) : req.body.description;
    const date = req.body.date;

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/news/${req.file.filename}`;
    }

    const result = await pool.query(
      'INSERT INTO news (title, description, date, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, date, imagePath]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create news error:', err);
    res.status(500).json({ error: 'Ошибка при создании новости' });
  }
};

// ================== UPDATE NEWS ==================
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const title = typeof req.body.title === 'string' ? JSON.parse(req.body.title) : req.body.title;
    const description = typeof req.body.description === 'string' ? JSON.parse(req.body.description) : req.body.description;
    const date = req.body.date;

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/news/${req.file.filename}`;
    }

    const result = await pool.query(
      'UPDATE news SET title=$1, description=$2, date=$3, image=COALESCE($4, image) WHERE id=$5 RETURNING *',
      [title, description, date, imagePath, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update news error:', err);
    res.status(500).json({ error: 'Ошибка при обновлении новости' });
  }
};

// ================== DELETE NEWS ==================
exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM news WHERE id=$1', [id]);
    res.json({ message: 'Новость удалена' });
  } catch (err) {
    console.error('Delete news error:', err);
    res.status(500).json({ error: 'Ошибка при удалении новости' });
  }
};
  