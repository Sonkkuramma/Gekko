// lib/repositories/testPackRepository.js
import { db } from '@/lib/db';

export async function getTestPackBySlug(slug) {
  try {
    const [testPack] = await db.query(
      `SELECT id, name, pack_type, is_premium 
       FROM test_packs 
       WHERE slug = ?`,
      [slug]
    );
    return testPack;
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch test pack');
  }
}
