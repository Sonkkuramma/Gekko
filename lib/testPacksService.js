import mysql from 'mysql2/promise';

let pool;

async function getConnection() {
  if (!pool) {
    console.log('Creating new connection pool');
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    try {
      const connection = await pool.getConnection();
      console.log('Successfully connected to the database');
      connection.release();
    } catch (error) {
      console.error('Error connecting to the database:', error);
    }
  }
  return pool;
}

export async function getTestPackBySlug(slug) {
  console.log('Attempting to fetch test pack by slug:', slug);
  try {
    const conn = await getConnection();
    const [testPacks] = await conn.query(
      `
        SELECT 
          tp.id, tp.exam, tp.test_pack_type, tp.title, tp.subtitle, 
          tp.test_pack_slug, tp.is_premium, tp.image_url, tp.icon_url,
          GROUP_CONCAT(DISTINCT t.tag_name) as tags
        FROM test_packs tp
        LEFT JOIN test_pack_tag_association tpta ON tp.id = tpta.test_pack_id
        LEFT JOIN tags t ON tpta.tag_id = t.id
        WHERE tp.test_pack_slug = ?
        GROUP BY tp.id
      `,
      [slug]
    );

    if (testPacks.length === 0) {
      console.log('No test pack found with slug:', slug);
      return null;
    }

    const testPack = testPacks[0];
    console.log('Successfully fetched test pack:', testPack);

    // Fetch modules for this test pack
    const [modules] = await conn.query(
      'SELECT * FROM modules WHERE test_pack_id = ?',
      [testPack.id]
    );

    for (let module of modules) {
      const [topics] = await conn.query(
        'SELECT * FROM topics WHERE module_id = ?',
        [module.id]
      );
      for (let topic of topics) {
        const [tests] = await conn.query(
          'SELECT * FROM tests WHERE topic_id = ?',
          [topic.id]
        );
        topic.tests = tests;
      }
      module.topics = topics;
    }

    return {
      ...testPack,
      tags: testPack.tags ? testPack.tags.split(',') : [],
      modules,
    };
  } catch (error) {
    console.error('Error fetching test pack by slug:', error);
    return null;
  }
}

export { getConnection };

export default {
  getConnection,
  getTestPackBySlug,
};
