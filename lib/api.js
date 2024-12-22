import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'test_pack_mod',
  password: ',4!J#&7X>u.O',
  database: 'test_pack_management_lama',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function getTestPackBundles() {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM test_bundles
    `);

    return rows;
  } catch (error) {
    console.error('Error fetching test pack bundles:', error);
    return [];
  }
}

export async function getTestPacks() {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM test_packs
    `);

    return rows;
  } catch (error) {
    console.error('Error fetching test packs:', error);
    return [];
  }
}

export async function getTestPacksForBundle(bundleId) {
  try {
    const [rows] = await pool.query(
      `
      SELECT tp.* 
      FROM test_packs tp
      JOIN bundle_test_pack_association btpa ON tp.id = btpa.test_pack_id
      WHERE btpa.test_bundle_id = ?
    `,
      [bundleId]
    );

    return rows;
  } catch (error) {
    console.error(`Error fetching test packs for bundle ${bundleId}:`, error);
    return [];
  }
}
