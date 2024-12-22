import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const bundleId = searchParams.get('bundleId');

  let conn;
  try {
    if (!bundleId) {
      return NextResponse.json(
        { error: 'Bundle ID is required' },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    conn = await pool.getConnection();

    const query = `
      SELECT p.* 
      FROM test_packs p
      JOIN bundle_packs bp ON p.pack_id = bp.pack_id
      WHERE bp.bundle_id = ?
    `;

    const [rows] = await conn.query(query, [bundleId]);

    return NextResponse.json({ packs: rows });
  } catch (error) {
    console.error('Error fetching bundle packs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bundle packs: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const bundleId = searchParams.get('bundleId');
  const packId = searchParams.get('packId');

  let conn;
  try {
    if (!bundleId || !packId) {
      return NextResponse.json(
        { error: 'Bundle ID and Pack ID are required' },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    conn = await pool.getConnection();

    await conn.query(
      'INSERT INTO bundle_packs (bundle_id, pack_id) VALUES (?, ?)',
      [bundleId, packId]
    );

    return NextResponse.json({ message: 'Pack added to bundle successfully' });
  } catch (error) {
    console.error('Error adding pack to bundle:', error);
    return NextResponse.json(
      { error: 'Failed to add pack to bundle: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const bundleId = searchParams.get('bundleId');
  const packId = searchParams.get('packId');

  let conn;
  try {
    if (!bundleId || !packId) {
      return NextResponse.json(
        { error: 'Bundle ID and Pack ID are required' },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    conn = await pool.getConnection();

    await conn.query(
      'DELETE FROM bundle_packs WHERE bundle_id = ? AND pack_id = ?',
      [bundleId, packId]
    );

    return NextResponse.json({
      message: 'Pack removed from bundle successfully',
    });
  } catch (error) {
    console.error('Error removing pack from bundle:', error);
    return NextResponse.json(
      { error: 'Failed to remove pack from bundle: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}
export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  const bundleId = searchParams.get('bundleId');

  let conn;
  try {
    if (!bundleId) {
      return NextResponse.json(
        { error: 'Bundle ID is required' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const packIds = data.packs;

    if (!Array.isArray(packIds)) {
      return NextResponse.json(
        { error: 'Invalid packs data' },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    conn = await pool.getConnection();

    await conn.beginTransaction();

    // Remove all existing associations
    await conn.query('DELETE FROM bundle_packs WHERE bundle_id = ?', [
      bundleId,
    ]);

    // Add new associations
    if (packIds.length > 0) {
      const values = packIds.map((packId) => [bundleId, packId]);
      await conn.query(
        'INSERT INTO bundle_packs (bundle_id, pack_id) VALUES ?',
        [values]
      );
    }

    await conn.commit();

    return NextResponse.json({ message: 'Bundle packs updated successfully' });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Error updating bundle packs:', error);
    return NextResponse.json(
      { error: 'Failed to update bundle packs: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}
