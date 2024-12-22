// lib/db.js

import mysql from 'mysql2/promise';
import CircuitBreaker from './circuitBreaker';

let pool;

const circuitBreaker = new CircuitBreaker();

export async function getConnection() {
  if (!pool) {
    console.log('Creating new connection pool');
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
    });

    try {
      const connection = await pool.getConnection();
      console.log('Successfully connected to the database');
      connection.release();
    } catch (error) {
      console.error('Error connecting to the database:', error);
      pool = null;
      throw error;
    }
  }
  return pool;
}

export async function getTestPackBundles() {
  return circuitBreaker.call(async () => {
    console.log('Attempting to fetch test pack bundles...');
    try {
      const pool = await getConnection();
      const [rows] = await pool.query(`
        SELECT 
          b.bundle_id, b.exam_id, b.bundle_name, b.bundle_slug, b.bundle_short_description,
          b.bundle_long_description, b.is_premium, b.bundle_image_url,
          b.bundle_banner_url,
          GROUP_CONCAT(DISTINCT bpt.pack_type) as pack_types,
          GROUP_CONCAT(DISTINCT bp.pack_id) as pack_ids,
          GROUP_CONCAT(DISTINCT t.tag_name) as tags
        FROM bundles b
        LEFT JOIN bundle_pack_types bpt ON b.bundle_id = bpt.bundle_id
        LEFT JOIN bundle_packs bp ON b.bundle_id = bp.bundle_id
        LEFT JOIN bundle_tag_association bta ON b.bundle_id = bta.bundle_id
        LEFT JOIN tags t ON bta.tag_id = t.tag_id
        GROUP BY b.bundle_id
      `);

      console.log('Successfully fetched test pack bundles:', rows);

      return rows.map((row) => ({
        ...row,
        pack_types: row.pack_types ? row.pack_types.split(',') : [],
        pack_ids: row.pack_ids ? row.pack_ids.split(',') : [],
        tags: row.tags ? row.tags.split(',') : [],
      }));
    } catch (error) {
      console.error('Error fetching test pack bundles:', error);
      throw error;
    }
  });
}

export async function getTestPacks() {
  return circuitBreaker.call(async () => {
    console.log('Attempting to fetch test packs...');
    try {
      const pool = await getConnection();
      const [testPacks] = await pool.query(`
        SELECT 
          tp.pack_id, tp.exam_id, tp.pack_type, tp.pack_name, tp.pack_slug, 
          tp.pack_short_description, tp.pack_long_description,
          tp.is_premium, tp.pack_image_url, tp.pack_banner_url,
          GROUP_CONCAT(DISTINCT t.tag_name) as tags
        FROM test_packs tp
        LEFT JOIN test_pack_tag_association tpta ON tp.pack_id = tpta.test_pack_id
        LEFT JOIN tags t ON tpta.tag_id = t.tag_id
        GROUP BY tp.pack_id
      `);

      console.log('Successfully fetched test packs:', testPacks);

      const testPacksWithDetails = await Promise.all(
        testPacks.map(async (testPack) => {
          const [tests] = await pool.query(
            'SELECT * FROM pack_tests WHERE pack_id = ?',
            [testPack.pack_id]
          );

          // Fetch details for each test based on the pack_type
          for (let test of tests) {
            switch (testPack.pack_type) {
              case 'topic tests':
                const [topicTest] = await pool.query(
                  `
                  SELECT tt.*, GROUP_CONCAT(q.question_id) as question_ids
                  FROM topic_tests tt
                  LEFT JOIN topic_test_questions ttq ON tt.topic_test_id = ttq.topic_test_id
                  LEFT JOIN questions q ON ttq.question_id = q.question_id
                  WHERE tt.topic_test_id = ?
                  GROUP BY tt.topic_test_id
                `,
                  [test.test_id]
                );
                test.details = topicTest[0];
                break;
              case 'module tests':
                const [moduleTest] = await pool.query(
                  `
                  SELECT mt.*, GROUP_CONCAT(q.question_id) as question_ids
                  FROM module_tests mt
                  LEFT JOIN module_test_questions mtq ON mt.module_test_id = mtq.module_test_id
                  LEFT JOIN questions q ON mtq.question_id = q.question_id
                  WHERE mt.module_test_id = ?
                  GROUP BY mt.module_test_id
                `,
                  [test.test_id]
                );
                test.details = moduleTest[0];
                break;
              case 'section tests':
                const [sectionTest] = await pool.query(
                  `
                  SELECT st.*, GROUP_CONCAT(mt.module_test_id) as module_test_ids
                  FROM section_tests st
                  LEFT JOIN section_test_module_test stmt ON st.section_test_id = stmt.section_test_id
                  LEFT JOIN module_tests mt ON stmt.module_test_id = mt.module_test_id
                  WHERE st.section_test_id = ?
                  GROUP BY st.section_test_id
                `,
                  [test.test_id]
                );
                test.details = sectionTest[0];
                break;
              case 'fulllength tests':
                const [fullLengthTest] = await pool.query(
                  `
                  SELECT ft.*, GROUP_CONCAT(st.section_test_id) as section_test_ids
                  FROM fulllength_tests ft
                  LEFT JOIN fulllength_test_section_test ftst ON ft.fulllength_test_id = ftst.fulllength_test_id
                  LEFT JOIN section_tests st ON ftst.section_test_id = st.section_test_id
                  WHERE ft.fulllength_test_id = ?
                  GROUP BY ft.fulllength_test_id
                `,
                  [test.test_id]
                );
                test.details = fullLengthTest[0];
                break;
            }
          }

          return {
            ...testPack,
            tags: testPack.tags ? testPack.tags.split(',') : [],
            tests,
          };
        })
      );

      return testPacksWithDetails;
    } catch (error) {
      console.error('Error fetching test packs:', error);
      throw error;
    }
  });
}

export async function getTestPackBySlug(slug) {
  return circuitBreaker.call(async () => {
    console.log('Attempting to fetch test pack by slug:', slug);
    try {
      const pool = await getConnection();
      const [rows] = await pool.query(
        `
        SELECT 
          tp.pack_id, tp.exam_id, tp.pack_type, tp.pack_name, tp.pack_slug, 
          tp.pack_short_description, tp.pack_long_description,
          tp.is_premium, tp.pack_image_url, tp.pack_banner_url,
          GROUP_CONCAT(DISTINCT t.tag_name) as tags
        FROM test_packs tp
        LEFT JOIN test_pack_tag_association tpta ON tp.pack_id = tpta.test_pack_id
        LEFT JOIN tags t ON tpta.tag_id = t.tag_id
        WHERE tp.pack_slug = ?
        GROUP BY tp.pack_id
      `,
        [slug]
      );

      if (rows.length === 0) {
        console.log('Test pack not found for slug:', slug);
        return null;
      }

      console.log('Successfully fetched test pack:', rows[0]);

      // Convert tags string to array
      const testPack = {
        ...rows[0],
        tags: rows[0].tags ? rows[0].tags.split(',') : [],
      };

      return testPack;
    } catch (error) {
      console.error('Error fetching test pack by slug:', error);
      throw error;
    }
  });
}

// Add cart-related functions to your existing exports
export async function findCart(userId, status = 'active') {
  return circuitBreaker.call(async () => {
    try {
      const pool = await getConnection();
      const [rows] = await pool.query(
        `SELECT * FROM carts WHERE user_id = ? AND status = ? LIMIT 1`,
        [userId, status]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding cart:', error);
      throw error;
    }
  });
}

export async function createCart(userId, status = 'active') {
  return circuitBreaker.call(async () => {
    try {
      const pool = await getConnection();
      // Generate a random cart_id (similar to your existing ID generation)
      const cartId = generateId(); // You'll need to implement this function

      await pool.query(
        `INSERT INTO carts (cart_id, user_id, status) VALUES (?, ?, ?)`,
        [cartId, userId, status]
      );

      return { cart_id: cartId, user_id: userId, status };
    } catch (error) {
      console.error('Error creating cart:', error);
      throw error;
    }
  });
}

export async function findCartItems(cartId) {
  return circuitBreaker.call(async () => {
    try {
      const pool = await getConnection();
      const [rows] = await pool.query(
        `SELECT 
          ci.*,
          tp.pack_name as title,
          tp.pack_short_description as description,
          tp.is_premium,
          tp.pack_image_url
        FROM cart_items ci
        JOIN test_packs tp ON ci.pack_id = tp.pack_id
        WHERE ci.cart_id = ?`,
        [cartId]
      );
      return rows;
    } catch (error) {
      console.error('Error finding cart items:', error);
      throw error;
    }
  });
}

export async function findCartItem(cartId, packId) {
  return circuitBreaker.call(async () => {
    try {
      const pool = await getConnection();
      const [rows] = await pool.query(
        `SELECT * FROM cart_items WHERE cart_id = ? AND pack_id = ? LIMIT 1`,
        [cartId, packId]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding cart item:', error);
      throw error;
    }
  });
}

export async function addCartItem(cartId, packId, quantity, price) {
  return circuitBreaker.call(async () => {
    try {
      const pool = await getConnection();
      const cartItemId = generateId(); // You'll need to implement this function

      await pool.query(
        `INSERT INTO cart_items (cart_item_id, cart_id, pack_id, quantity, price) 
         VALUES (?, ?, ?, ?, ?)`,
        [cartItemId, cartId, packId, quantity, price]
      );

      return {
        cart_item_id: cartItemId,
        cart_id: cartId,
        pack_id: packId,
        quantity,
        price,
      };
    } catch (error) {
      console.error('Error adding cart item:', error);
      throw error;
    }
  });
}

export async function updateCartItem(cartItemId, quantity) {
  return circuitBreaker.call(async () => {
    try {
      const pool = await getConnection();
      await pool.query(
        `UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?`,
        [quantity, cartItemId]
      );
      return { cart_item_id: cartItemId, quantity };
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  });
}

export async function removeCartItem(cartItemId) {
  return circuitBreaker.call(async () => {
    try {
      const pool = await getConnection();
      await pool.query(`DELETE FROM cart_items WHERE cart_item_id = ?`, [
        cartItemId,
      ]);
      return true;
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  });
}

export async function clearCart(cartId) {
  return circuitBreaker.call(async () => {
    try {
      const pool = await getConnection();
      await pool.query(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  });
}

// Helper function to generate IDs (similar to your existing ID generation)
function generateId(length = 4) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
export async function getUserEnrolledTestPacks(userId) {
  return circuitBreaker.call(async () => {
    console.log('Attempting to fetch user enrolled test packs...');
    try {
      const pool = await getConnection();
      const [rows] = await pool.query(
        `
        SELECT 
          tp.pack_id,
          tp.exam_id,
          tp.pack_type,
          tp.pack_name,
          tp.pack_short_description,
          tp.pack_slug,
          tp.is_premium,
          tp.pack_image_url,
          tp.pack_banner_url,
          GROUP_CONCAT(DISTINCT t.tag_name) as tags,
          ue.enrolled_at,
          ue.is_premium as enrollment_is_premium,
          ue.status as enrollment_status
        FROM test_packs tp
        INNER JOIN user_enrollments ue ON tp.pack_id = ue.test_pack_id
        LEFT JOIN test_pack_tag_association tpta ON tp.pack_id = tpta.test_pack_id
        LEFT JOIN tags t ON tpta.tag_id = t.tag_id
        WHERE ue.user_id = ?
          AND ue.status = 'active'
        GROUP BY 
          tp.pack_id, tp.exam_id, tp.pack_type, tp.pack_name, 
          tp.pack_short_description, tp.pack_slug, tp.is_premium, 
          tp.pack_image_url, tp.pack_banner_url,
          ue.enrolled_at, ue.is_premium, ue.status
        ORDER BY ue.enrolled_at DESC
        `,
        [userId]
      );

      console.log('Successfully fetched user enrolled test packs:', rows);

      return rows.map((row) => ({
        id: row.pack_id,
        examId: row.exam_id,
        type: row.pack_type,
        title: row.pack_name,
        subtitle: row.pack_short_description,
        test_pack_slug: row.pack_slug,
        is_premium: Boolean(row.is_premium),
        enrollment_is_premium: Boolean(row.enrollment_is_premium),
        enrollment_status: row.enrollment_status,
        enrolled_at: row.enrolled_at,
        imageUrl: row.pack_image_url || null,
        bannerUrl: row.pack_banner_url || null,
        tags: row.tags ? row.tags.split(',') : [],
      }));
    } catch (error) {
      console.error('Error fetching user enrolled test packs:', error);
      throw error;
    }
  });
}

// Update your default export
export default {
  getConnection,
  getTestPackBundles,
  getTestPacks,
  getTestPackBySlug,
  getUserEnrolledTestPacks, // Add this
};
