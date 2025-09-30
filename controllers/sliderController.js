const { pool } = require('../db/pool');
const path = require('path');
const fs = require('fs');

const getAllPublishings = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM publishing_slider ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const createPublishing = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const image = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/publishing/${req.file.filename}`
      : null;

    const result = await pool.query(
      'INSERT INTO publishing_slider (title, description, date, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, date, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const deletePublishing = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT image FROM publishing_slider WHERE id=$1', [id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Slide not found' });

    const image = result.rows[0].image;
    if (image) {
      // Удаляем файл изображения из диска
      const fileUrlPrefix = `${req.protocol}://${req.get('host')}/uploads/publishing/`;
      const filename = image.replace(fileUrlPrefix, '');
      const localPath = path.join(__dirname, '..', 'uploads', 'publishing', filename);

      fs.unlink(localPath, (err) => {
        if (err) console.error('Error deleting image from disk:', err);
      });
    }

    await pool.query('DELETE FROM publishing_slider WHERE id=$1', [id]);
    res.json({ message: 'Slide deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllPublishings,
  createPublishing,
  deletePublishing,
};
