import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const examId = searchParams.get('examId');
  const difficulty = searchParams.get('difficulty');
  const bundleId = searchParams.get('bundleId');

  let conn;
  try {
    console.log('Received GET request with params:', {
      examId,
      difficulty,
      bundleId,
    });

    const pool = await getConnection();
    console.log('Database connection pool obtained');

    conn = await pool.getConnection();
    console.log('Database connection established');

    if (bundleId) {
      console.log('Fetching packs for bundle:', bundleId);
      const query = `
        SELECT p.*, 
               CASE WHEN bp.bundle_id IS NOT NULL THEN 1 ELSE 0 END AS is_allocated
        FROM test_packs p
        LEFT JOIN bundle_packs bp ON p.pack_id = bp.pack_id AND bp.bundle_id = ?
      `;
      console.log('Executing query:', query);
      console.log('Query parameters:', [bundleId]);

      const [rows] = await conn.query(query, [bundleId]);

      console.log('Packs fetched:', rows.length);
      return NextResponse.json({ packs: rows });
    } else if (examId && difficulty) {
      console.log('Fetching packs by exam and difficulty:', {
        examId,
        difficulty,
      });
      const query = `
        SELECT pack_id, pack_name, pack_type, pack_difficulty 
        FROM test_packs 
        WHERE exam_id = ? AND pack_difficulty = ?
      `;
      console.log('Executing query:', query);
      console.log('Query parameters:', [examId, difficulty]);

      const [rows] = await conn.query(query, [examId, difficulty]);

      console.log('Packs fetched:', rows.length);
      return NextResponse.json({ packs: rows });
    } else {
      console.log('Invalid parameters provided');
      return NextResponse.json(
        {
          error:
            'Invalid parameters. Provide either bundleId or (examId and difficulty)',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in GET /api/packs:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch packs',
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  } finally {
    if (conn) {
      console.log('Releasing database connection');
      conn.release();
    }
  }
}

export async function POST(request) {
  let conn;
  try {
    const data = await request.json();
    const pool = await getConnection();
    conn = await pool.getConnection();

    const [result] = await conn.query(
      `INSERT INTO test_packs (exam_id, pack_name, pack_type, pack_difficulty) 
       VALUES (?, ?, ?, ?)`,
      [data.exam_id, data.pack_name, data.pack_type, data.pack_difficulty]
    );

    return NextResponse.json({
      message: 'Pack created successfully',
      packId: result.insertId,
    });
  } catch (error) {
    console.error('Error creating pack:', error);
    return NextResponse.json(
      { error: 'Failed to create pack: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}

export async function PUT(request) {
  let conn;
  try {
    const { searchParams } = new URL(request.url);
    const packId = searchParams.get('id');

    if (!packId) {
      return NextResponse.json(
        { error: 'Pack ID is required' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const pool = await getConnection();
    conn = await pool.getConnection();

    const [result] = await conn.query(
      `UPDATE test_packs 
       SET exam_id = ?, pack_name = ?, pack_type = ?, pack_difficulty = ?
       WHERE pack_id = ?`,
      [
        data.exam_id,
        data.pack_name,
        data.pack_type,
        data.pack_difficulty,
        packId,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Pack updated successfully' });
  } catch (error) {
    console.error('Error updating pack:', error);
    return NextResponse.json(
      { error: 'Failed to update pack: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}

export async function DELETE(request) {
  let conn;
  try {
    const { searchParams } = new URL(request.url);
    const packId = searchParams.get('id');

    if (!packId) {
      return NextResponse.json(
        { error: 'Pack ID is required' },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    conn = await pool.getConnection();

    // Start a transaction
    await conn.beginTransaction();

    // Delete from bundle_packs first (if there are any foreign key constraints)
    await conn.query('DELETE FROM bundle_packs WHERE pack_id = ?', [packId]);

    // Delete the pack
    const [result] = await conn.query(
      'DELETE FROM test_packs WHERE pack_id = ?',
      [packId]
    );

    // Commit the transaction
    await conn.commit();

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Pack deleted successfully' });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Error deleting pack:', error);
    return NextResponse.json(
      { error: 'Failed to delete pack: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}
