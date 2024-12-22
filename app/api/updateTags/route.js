import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST(request) {
  try {
    const { id, type, tags } = await request.json();

    const pool = await getConnection();

    let table, idColumn;
    if (type === 'pack') {
      table = 'test_pack_tag_association';
      idColumn = 'test_pack_id';
    } else if (type === 'bundle') {
      table = 'bundle_tag_association';
      idColumn = 'bundle_id';
    } else {
      throw new Error('Invalid type');
    }

    // Start a transaction
    await pool.query('START TRANSACTION');

    try {
      // Delete existing associations
      await pool.query(`DELETE FROM ${table} WHERE ${idColumn} = ?`, [id]);

      // Insert new associations
      if (tags && tags.length > 0) {
        const values = tags.map((tagId) => [id, tagId]);
        await pool.query(
          `INSERT INTO ${table} (${idColumn}, tag_id) VALUES ?`,
          [values]
        );
      }

      // Commit the transaction
      await pool.query('COMMIT');

      return NextResponse.json({ success: true, tags: tags });
    } catch (error) {
      // If there's an error, rollback the transaction
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating tags:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
