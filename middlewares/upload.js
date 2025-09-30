const multer = require('multer'); 
const path = require('path');
const fs = require('fs');

// Список папок для загрузки файлов
const folders = [
  'uploads/news/',
  'uploads/publishing/',
  'uploads/authors/',
  'uploads/articles/',
  'uploads/contact/' 
];

// Создаем папки, если их нет
folders.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created folder: ${dir}`);
  }
});

// Функция хранилища для multer с логами
const storage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`📝 Saving file to folder: ${folder}`);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}${ext}`;
    console.log(`📝 Generated filename: ${filename}`);
    cb(null, filename);
  },
});

// Универсальный фильтр по типу файлов
const fileFilter = (allowedExts) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    console.log(`✅ Accepted file: ${file.originalname}`);
    cb(null, true);
  } else {
    console.log(`❌ Rejected file: ${file.originalname}`);
    cb(new Error(`Only ${allowedExts.join(', ')} allowed`));
  }
};

// Настройки загрузки
const uploadNewsImage = multer({ storage: storage('uploads/news/') });
const uploadPublishingImage = multer({ storage: storage('uploads/publishing/') });
const uploadAuthorFile = multer({ 
  storage: storage('uploads/authors/'), 
  fileFilter: fileFilter(['.pdf', '.doc', '.docx']) 
});
const uploadArticleFile = multer({ 
  storage: storage('uploads/articles/'),  
  fileFilter: fileFilter(['.pdf']) 
});
const uploadContactImage = multer({
  storage: storage('uploads/contact/'), 
  fileFilter: fileFilter(['.jpg', '.jpeg', '.png', '.gif'])
});

module.exports = { 
  uploadNewsImage, 
  uploadPublishingImage, 
  uploadAuthorFile,
  uploadArticleFile,
  uploadContactImage
};
