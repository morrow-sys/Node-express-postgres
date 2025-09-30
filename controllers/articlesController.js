const pool = require('../db/pool');

// Хелпер для безопасного JSON.parse
const safeParseJSON = (value, fallback = null) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

// Получить все статьи
const getAllArticles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articles ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить статью по ID
const getArticleById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: 'Некорректный ID' });

  try {
    const result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Статья не найдена' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить статьи по journalAbbr
const getArticlesByJournal = async (req, res) => {
  const { journalAbbr } = req.params;
  if (!journalAbbr) return res.status(400).json({ message: 'Некорректный journalAbbr' });

  try {
    const result = await pool.query(
      'SELECT * FROM articles WHERE "journalAbbr"=$1 ORDER BY id DESC',
      [journalAbbr]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить статьи по journalAbbr + year + issueNumber
const getArticlesByJournalAndIssue = async (req, res) => {
  const { journalAbbr, year, issueNumber } = req.params;
  const yearInt = parseInt(year, 10);
  const issueInt = parseInt(issueNumber, 10);

  if (!journalAbbr || isNaN(yearInt) || isNaN(issueInt)) {
    console.warn('Некорректные параметры year или issueNumber:', { year, issueNumber });
    return res.status(400).json({ message: 'Некорректные параметры journalAbbr, year или issueNumber' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM articles 
       WHERE "journalAbbr" = $1 AND year = $2 AND "issueNumber" = $3
       ORDER BY id DESC`,
      [journalAbbr, yearInt, issueInt]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка получения статей по журналу/выпуску:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создать статью
const createArticle = async (req, res) => {
  try {
    const pdfFileName = req.file ? req.file.filename : null;
    const {
      journalAbbr,
      journalName,
      category,
      year,
      issueNumber,
      subIssueNumber,
      doi,
      titles,
      authors,
      abstracts,
      keywords,
      authorsInfo,
      udc,
      pageStart,
      pageEnd
    } = req.body;

    const yearInt = parseInt(year, 10);
    const issueInt = parseInt(issueNumber, 10);
    const subIssueInt = subIssueNumber ? parseInt(subIssueNumber, 10) : null;
    const pageStartInt = pageStart ? parseInt(pageStart, 10) : null;
    const pageEndInt = pageEnd ? parseInt(pageEnd, 10) : null;

    if (!journalAbbr || !journalName || isNaN(yearInt) || isNaN(issueInt)) {
      return res.status(400).json({ message: 'Некорректные данные для создания статьи' });
    }

    const result = await pool.query(
      `INSERT INTO articles 
        ("journalAbbr","journalName", category, year, "issueNumber", "subIssueNumber", doi,
         titles, authors, abstracts, keywords, "authorsInfo", udc, "pageStart", "pageEnd", "pdfFileName") 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [
        journalAbbr,
        journalName,
        category,
        yearInt,
        issueInt,
        subIssueInt,
        doi,
        safeParseJSON(titles),
        safeParseJSON(authors),
        safeParseJSON(abstracts),
        safeParseJSON(keywords),
        safeParseJSON(authorsInfo),
        safeParseJSON(udc),
        pageStartInt,
        pageEndInt,
        pdfFileName
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка создания статьи:', err);
    res.status(500).json({ message: 'Ошибка сервера при создании статьи' });
  }
};

// Обновить статью
const updateArticle = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: 'Некорректный ID' });

  try {
    const pdfFileName = req.file ? req.file.filename : req.body.pdfFileName;
    const {
      journalAbbr,
      journalName,
      category,
      year,
      issueNumber,
      subIssueNumber,
      doi,
      titles,
      authors,
      abstracts,
      keywords,
      authorsInfo,
      udc,
      pageStart,
      pageEnd
    } = req.body;

    const yearInt = parseInt(year, 10);
    const issueInt = parseInt(issueNumber, 10);
    const subIssueInt = subIssueNumber ? parseInt(subIssueNumber, 10) : null;
    const pageStartInt = pageStart ? parseInt(pageStart, 10) : null;
    const pageEndInt = pageEnd ? parseInt(pageEnd, 10) : null;

    if (!journalAbbr || !journalName || isNaN(yearInt) || isNaN(issueInt)) {
      return res.status(400).json({ message: 'Некорректные данные для обновления статьи' });
    }

    const result = await pool.query(
      `UPDATE articles SET
        "journalAbbr"=$1, "journalName"=$2, category=$3, year=$4, "issueNumber"=$5, "subIssueNumber"=$6, doi=$7,
        titles=$8, authors=$9, abstracts=$10, keywords=$11, "authorsInfo"=$12, udc=$13,
        "pageStart"=$14, "pageEnd"=$15, "pdfFileName"=$16, updated_at=NOW()
       WHERE id=$17 RETURNING *`,
      [
        journalAbbr,
        journalName,
        category,
        yearInt,
        issueInt,
        subIssueInt,
        doi,
        safeParseJSON(titles),
        safeParseJSON(authors),
        safeParseJSON(abstracts),
        safeParseJSON(keywords),
        safeParseJSON(authorsInfo),
        safeParseJSON(udc),
        pageStartInt,
        pageEndInt,
        pdfFileName,
        id
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'Статья не найдена' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка обновления статьи:', err);
    res.status(500).json({ message: 'Ошибка сервера при обновлении статьи' });
  }
};

// Удалить статью
const deleteArticle = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: 'Некорректный ID' });

  try {
    const result = await pool.query('DELETE FROM articles WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Статья не найдена' });
    res.json({ message: 'Статья удалена' });
  } catch (err) {
    console.error('Ошибка удаления статьи:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticlesByJournal,
  getArticlesByJournalAndIssue,
};
