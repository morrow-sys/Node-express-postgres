const pool = require('../db/pool');
const path = require('path');
const fs = require('fs');

// Директория для файлов авторов
const uploadDir = path.join(__dirname, '..', 'uploads', 'authors');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const getAllAuthorFiles = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM author_files ORDER BY "order" ASC, id DESC');
    const files = rows.map(r => ({
      id: r.id,
      title: r.title,
      url: r.filepath ? `${req.protocol}://${req.get('host')}/uploads/authors/${r.filepath}` : null,
      order: r.order,
    }));
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const createAuthorFile = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    let filename = null;
    if (req.file) filename = req.file.filename;

    const orderRes = await pool.query('SELECT COALESCE(MAX("order"), 0) AS max_order FROM author_files');
    const newOrder = orderRes.rows[0].max_order + 1;

    const result = await pool.query(
      'INSERT INTO author_files (title, filepath, "order") VALUES ($1, $2, $3) RETURNING *',
      [title, filename, newOrder]
    );

    res.status(201).json({
      id: result.rows[0].id,
      title: result.rows[0].title,
      url: filename ? `${req.protocol}://${req.get('host')}/uploads/authors/${filename}` : null,
      order: result.rows[0].order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const updateAuthorFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const result = await pool.query(
      'UPDATE author_files SET title=$1 WHERE id=$2 RETURNING *',
      [title, id]
    );

    if (!result.rows.length) return res.status(404).json({ message: 'File not found' });

    const filename = result.rows[0].filepath;
    res.json({
      id: result.rows[0].id,
      title: result.rows[0].title,
      url: filename ? `${req.protocol}://${req.get('host')}/uploads/authors/${filename}` : null,
      order: result.rows[0].order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const deleteAuthorFile = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT filepath FROM author_files WHERE id=$1', [id]);
    if (!result.rows.length) return res.status(404).json({ message: 'File not found' });

    const filename = result.rows[0].filepath;
    if (filename) {
      const localPath = path.join(uploadDir, filename);
      if (fs.existsSync(localPath)) {
        fs.unlink(localPath, (err) => {
          if (err) console.error('Error deleting file from disk:', err);
        });
      }
    }

    await pool.query('DELETE FROM author_files WHERE id=$1', [id]);
    res.json({ message: 'File deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const updateOrderAuthorFiles = async (req, res) => {
  try {
    const filesOrder = req.body;
    if (!Array.isArray(filesOrder)) {
      return res.status(400).json({ message: 'Invalid payload, expected an array' });
    }

    const queries = filesOrder.map(f =>
      pool.query('UPDATE author_files SET "order" = $1 WHERE id = $2', [f.order, f.id])
    );
    await Promise.all(queries);

    res.json({ message: 'Order updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllAuthorFiles,
  createAuthorFile,
  updateAuthorFile,
  deleteAuthorFile,
  updateOrderAuthorFiles,
};
