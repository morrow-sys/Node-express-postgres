const pool = require('./pool');

async function initTables() {
  try {
    // Таблица контактов
    await pool.query(`
    CREATE TABLE IF NOT EXISTS contact (
        id SERIAL PRIMARY KEY,
        phone TEXT DEFAULT '',
        email TEXT DEFAULT '',
        address JSONB DEFAULT '{}'::jsonb,
        images JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );
    `);

    // Таблица новостей
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title JSONB DEFAULT '{}'::jsonb,
        description JSONB DEFAULT '{}'::jsonb,
        date TIMESTAMP NOT NULL,
        image TEXT
      );
    `);

    // Таблица слайдера публикаций
    await pool.query(`
      CREATE TABLE IF NOT EXISTS publishing_slider (
        id SERIAL PRIMARY KEY,
        title JSONB DEFAULT '{}'::jsonb,
        description JSONB DEFAULT '{}'::jsonb,
        date TIMESTAMP NOT NULL,
        image TEXT
      );
    `);

    // Авторы файлов
    await pool.query(`
      CREATE TABLE IF NOT EXISTS author_files (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        filepath TEXT,
        "order" INTEGER DEFAULT 0
      );
    `);

    // Администраторы
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin'
      );
    `);

    // Журналы
    await pool.query(`
      CREATE TABLE IF NOT EXISTS journals (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        abbreviation TEXT UNIQUE NOT NULL,
        about JSONB DEFAULT '{}'::jsonb,
        editorialBoard JSONB DEFAULT '{}'::jsonb,
        indexing JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Книги
    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Категории
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Статьи
    await pool.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        "journalAbbr" TEXT NOT NULL,
        "journalName" TEXT NOT NULL,
        category TEXT NOT NULL,
        year INT NOT NULL,
        "issueNumber" TEXT NOT NULL,
        "subIssueNumber" TEXT,
        doi TEXT,
        titles JSONB DEFAULT '{}'::jsonb,
        authors JSONB DEFAULT '{}'::jsonb,
        abstracts JSONB DEFAULT '{}'::jsonb,
        keywords JSONB DEFAULT '{}'::jsonb,
        "authorsInfo" JSONB DEFAULT '{}'::jsonb,
        udc JSONB DEFAULT '{}'::jsonb,
        "pageStart" INT,
        "pageEnd" INT,
        "pdfFileName" TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Ассоциации
    await pool.query(`
      CREATE TABLE IF NOT EXISTS associations (
        id SERIAL PRIMARY KEY,  
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // История загрузок файлов
    await pool.query(`  
      CREATE TABLE IF NOT EXISTS uploads (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        originalname TEXT NOT NULL,
        mimetype TEXT,
        size INTEGER,
        path TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ All tables ensured');
  } catch (err) {
    console.error('❌ Error initializing tables:', err);
  }
}

module.exports = initTables;
