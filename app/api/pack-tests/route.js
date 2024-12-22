// app/api/pack-tests/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const packId = searchParams.get('packId');

  if (!packId) {
    return NextResponse.json({ error: 'Pack ID is required' }, { status: 400 });
  }

  try {
    const pool = await getConnection();
    const [rows] = await pool.query(
      'SELECT test_id FROM pack_tests WHERE pack_id = ?',
      [packId]
    );

    return NextResponse.json({ testIds: rows.map((row) => row.test_id) });
  } catch (error) {
    console.error('Error fetching tests for pack:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tests for pack', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const pool = await getConnection();

  try {
    const { packId, testIds } = await request.json();
    console.log('Updating tests for pack:', { packId, testIds });

    // Since we can't use transactions directly with the pool,
    // we'll do our best to ensure atomicity

    // First, delete existing associations
    const [deleteResult] = await pool.query(
      'DELETE FROM pack_tests WHERE pack_id = ?',
      [packId]
    );
    console.log('Deleted existing associations:', deleteResult);

    // Then insert new associations if there are any
    if (testIds && testIds.length > 0) {
      // Prepare values for bulk insert, excluding 'id' as it's auto-increment
      const insertValues = testIds.map((testId) => [packId, testId]);

      const [insertResult] = await pool.query(
        'INSERT INTO pack_tests (pack_id, test_id) VALUES ?',
        [insertValues]
      );
      console.log('Inserted new associations:', insertResult);
    }

    return NextResponse.json({
      message: 'Tests updated for pack successfully',
      updatedCount: testIds ? testIds.length : 0,
    });
  } catch (error) {
    console.error('Error updating tests for pack:', error);
    return NextResponse.json(
      {
        error: 'Failed to update tests for pack',
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
