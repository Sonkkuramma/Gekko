import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

function generateBundleId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST(request) {
  let conn;
  try {
    const data = await request.json();
    console.log('Received data:', data);

    const pool = await getConnection();
    conn = await pool.getConnection();

    // Generate a unique bundle_id
    let bundle_id;
    let isUnique = false;
    while (!isUnique) {
      bundle_id = generateBundleId();
      const [existing] = await conn.query(
        'SELECT 1 FROM bundles WHERE bundle_id = ?',
        [bundle_id]
      );
      if (existing.length === 0) {
        isUnique = true;
      }
    }

    // Start a transaction
    await conn.beginTransaction();

    // Insert the new bundle into the database
    const [result] = await conn.query(
      `INSERT INTO bundles 
       (bundle_id, exam_id, bundle_name, bundle_slug, bundle_short_description, 
        bundle_long_description, is_premium, bundle_image_url, bundle_banner_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bundle_id,
        data.exam_id,
        data.bundle_name,
        data.bundle_slug,
        data.bundle_short_description,
        data.bundle_long_description,
        data.is_premium,
        data.bundle_image_url,
        data.bundle_banner_url,
      ]
    );

    // Insert pack types
    for (const pack_type of data.pack_types) {
      await conn.query(
        `INSERT INTO bundle_pack_types (bundle_id, pack_type) VALUES (?, ?)`,
        [bundle_id, pack_type]
      );
    }

    // Commit the transaction
    await conn.commit();

    return NextResponse.json({
      message: 'Bundle created successfully',
      data: { ...data, bundle_id },
    });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Error creating bundle:', error);
    return NextResponse.json(
      { error: 'Failed to create bundle: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}

export async function GET(request) {
  let conn;
  try {
    const { searchParams } = new URL(request.url);
    const bundleId = searchParams.get('id');

    const pool = await getConnection();
    conn = await pool.getConnection();

    if (bundleId) {
      // Fetch a specific bundle
      const [bundles] = await conn.query(
        `
        SELECT b.*, GROUP_CONCAT(bpt.pack_type) as pack_types
        FROM bundles b
        LEFT JOIN bundle_pack_types bpt ON b.bundle_id = bpt.bundle_id
        WHERE b.bundle_id = ?
        GROUP BY b.bundle_id
      `,
        [bundleId]
      );

      if (bundles.length === 0) {
        return NextResponse.json(
          { error: 'Bundle not found' },
          { status: 404 }
        );
      }

      const bundle = bundles[0];
      bundle.pack_types = bundle.pack_types ? bundle.pack_types.split(',') : [];

      return NextResponse.json(bundle);
    } else {
      // Fetch all bundles
      const [bundles] = await conn.query(`
        SELECT b.*, GROUP_CONCAT(bpt.pack_type) as pack_types
        FROM bundles b
        LEFT JOIN bundle_pack_types bpt ON b.bundle_id = bpt.bundle_id
        GROUP BY b.bundle_id
      `);

      // Convert pack_types string to array
      bundles.forEach((bundle) => {
        bundle.pack_types = bundle.pack_types
          ? bundle.pack_types.split(',')
          : [];
      });

      return NextResponse.json(bundles);
    }
  } catch (error) {
    console.error('Error fetching bundles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bundles: ' + error.message },
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
    const bundleId = searchParams.get('id');

    if (!bundleId) {
      return NextResponse.json(
        { error: 'Bundle ID is required' },
        { status: 400 }
      );
    }

    const data = await request.json();
    console.log('Received update data:', data);

    const pool = await getConnection();
    conn = await pool.getConnection();

    await conn.beginTransaction();

    // Update the UPDATE query to remove bundle_difficulty
    const [result] = await conn.query(
      `UPDATE bundles 
       SET exam_id = ?, bundle_name = ?, bundle_slug = ?, bundle_short_description = ?, 
           bundle_long_description = ?, is_premium = ?, 
           bundle_image_url = ?, bundle_banner_url = ?
       WHERE bundle_id = ?`,
      [
        data.exam_id,
        data.bundle_name,
        data.bundle_slug,
        data.bundle_short_description,
        data.bundle_long_description,
        data.is_premium,
        data.bundle_image_url,
        data.bundle_banner_url,
        bundleId,
      ]
    );
    // Update pack types
    await conn.query('DELETE FROM bundle_pack_types WHERE bundle_id = ?', [
      bundleId,
    ]);
    for (const pack_type of data.pack_types) {
      await conn.query(
        `INSERT INTO bundle_pack_types (bundle_id, pack_type) VALUES (?, ?)`,
        [bundleId, pack_type]
      );
    }

    // Commit the transaction
    await conn.commit();

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Bundle updated successfully',
      data: { ...data, bundle_id: bundleId },
    });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Error updating bundle:', error);
    return NextResponse.json(
      { error: 'Failed to update bundle: ' + error.message },
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
    const bundleId = searchParams.get('id');

    if (!bundleId) {
      return NextResponse.json(
        { error: 'Bundle ID is required' },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    conn = await pool.getConnection();

    // Start a transaction
    await conn.beginTransaction();

    // Delete pack types (this will be automatic if you've set up ON DELETE CASCADE)
    await conn.query('DELETE FROM bundle_pack_types WHERE bundle_id = ?', [
      bundleId,
    ]);

    // Delete the bundle
    const [result] = await conn.query(
      'DELETE FROM bundles WHERE bundle_id = ?',
      [bundleId]
    );

    // Commit the transaction
    await conn.commit();

    if (result.affectedRows === 1) {
      return NextResponse.json({ message: 'Bundle deleted successfully' });
    } else {
      return NextResponse.json(
        { error: 'Bundle not found or already deleted' },
        { status: 404 }
      );
    }
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Error deleting bundle:', error);
    return NextResponse.json(
      { error: 'Failed to delete bundle: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}
