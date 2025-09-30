const pool = require('../db/pool');
const fs = require('fs');
const path = require('path');

// Получение контакта
exports.getContact = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact LIMIT 1');
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error('Ошибка при получении контактов:', err);
    res.status(500).json({ message: 'Ошибка сервера при получении контактов' });
  }
};

// Обновление контакта
exports.updateContact = async (req, res) => {
  try {
    const files = req.files || [];
    const { phone, email, address_ru, address_en, address_ky } = req.body;

    // Получаем существующую запись
    const result = await pool.query('SELECT * FROM contact LIMIT 1');
    let contact = result.rows[0];

    // Массив новых файлов
    const newImages = files.map(f => f.filename);

    if (!contact) {
      // Если записи нет — создаём новую
      const insert = await pool.query(
        `INSERT INTO contact (phone, email, address, images) VALUES ($1, $2, $3, $4) RETURNING *`,
        [
          phone || '',
          email || '',
          { ru: address_ru || '', en: address_en || '', ky: address_ky || '' },
          JSON.stringify(newImages)
        ]
      );
      contact = insert.rows[0];
    } else {
      // Берем старые изображения как массив
      let oldImages = [];
      if (contact.images) {
        if (typeof contact.images === 'string') {
          oldImages = JSON.parse(contact.images);
        } else if (Array.isArray(contact.images)) {
          oldImages = contact.images;
        }
      }

      const updatedImages = [...oldImages, ...newImages];

      const update = await pool.query(
        `UPDATE contact 
         SET phone=$1, email=$2, address=$3, images=$4, updated_at=NOW() 
         WHERE id=$5 RETURNING *`,
        [
          phone || '',
          email || '',
          { ru: address_ru || '', en: address_en || '', ky: address_ky || '' },
          JSON.stringify(updatedImages),
          contact.id
        ]
      );

      contact = update.rows[0];
    }

    res.json(contact);
  } catch (err) {
    console.error('Ошибка при обновлении контакта:', err);
    res.status(500).json({ message: 'Ошибка сервера при обновлении контакта' });
  }
};

// Удаление изображения
exports.deleteContactImage = async (req, res) => {
  try {
    const { imageName } = req.params;

    const result = await pool.query('SELECT * FROM contact LIMIT 1');
    const contact = result.rows[0];
    if (!contact) return res.status(404).json({ message: 'Контакт не найден' });

    let oldImages = [];
    if (contact.images) {
      if (typeof contact.images === 'string') oldImages = JSON.parse(contact.images);
      else if (Array.isArray(contact.images)) oldImages = contact.images;
    }

    const images = oldImages.filter(img => img !== imageName);

    await pool.query(
      'UPDATE contact SET images=$1, updated_at=NOW() WHERE id=$2',
      [JSON.stringify(images), contact.id]
    );

    const filePath = path.join(__dirname, '../uploads/contact', imageName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ ...contact, images });
  } catch (err) {
    console.error('Ошибка при удалении изображения:', err);
    res.status(500).json({ message: 'Ошибка сервера при удалении изображения' });
  }
};
