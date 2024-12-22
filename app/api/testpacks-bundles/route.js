// app/api/testpacks-bundles/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  let conn;
  try {
    conn = await db.getConnection();

    // Fetch test packs with their tags
    const testPacksQuery = `
      SELECT tp.*, GROUP_CONCAT(t.tag_name) as tags
      FROM test_packs tp
      LEFT JOIN test_pack_tag_association tpta ON tp.id = tpta.test_pack_id
      LEFT JOIN tags t ON tpta.tag_id = t.id
      GROUP BY tp.id
    `;
    const [testPacks] = await conn.query(testPacksQuery);

    // Fetch bundles with their associated test pack ids and tags
    const bundlesQuery = `
      SELECT tb.*, 
             GROUP_CONCAT(DISTINCT tp.id) as test_pack_ids,
             GROUP_CONCAT(DISTINCT t.tag_name) as tags
      FROM test_bundles tb
      LEFT JOIN bundle_test_pack_association btpa ON tb.id = btpa.bundle_id
      LEFT JOIN test_packs tp ON btpa.test_pack_id = tp.id
      LEFT JOIN test_pack_tag_association tpta ON tp.id = tpta.test_pack_id
      LEFT JOIN tags t ON tpta.tag_id = t.id
      GROUP BY tb.id
    `;
    const [bundles] = await conn.query(bundlesQuery);

    // Process the fetched data
    const processedTestPacks = testPacks.map((pack) => ({
      ...pack,
      tags: pack.tags ? pack.tags.split(',') : [],
    }));

    const processedBundles = bundles.map((bundle) => ({
      ...bundle,
      testPacks: bundle.test_pack_ids
        ? bundle.test_pack_ids.split(',').map((id) => parseInt(id))
        : [],
      tags: bundle.tags ? bundle.tags.split(',') : [],
    }));

    return NextResponse.json({
      testPacks: processedTestPacks,
      bundles: processedBundles,
    });
  } catch (error) {
    console.error('Error fetching test packs and bundles:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}

export async function POST(request) {
  let conn;
  try {
    const body = await request.json();
    conn = await db.getConnection();

    if (body.type === 'testPack') {
      const {
        exam,
        test_pack_type,
        title,
        subtitle,
        test_pack_slug,
        is_premium,
        image_url,
        icon_url,
      } = body;
      const [result] = await conn.query(
        'INSERT INTO test_packs (exam, test_pack_type, title, subtitle, test_pack_slug, is_premium, image_url, icon_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          exam,
          test_pack_type,
          title,
          subtitle,
          test_pack_slug,
          is_premium,
          image_url,
          icon_url,
        ]
      );
      return NextResponse.json(
        { id: result.insertId, ...body },
        { status: 201 }
      );
    } else if (body.type === 'bundle') {
      const { exam, bundle_name, bundle_slug, description, image_url } = body;
      const [result] = await conn.query(
        'INSERT INTO test_bundles (exam, bundle_name, bundle_slug, description, image_url) VALUES (?, ?, ?, ?, ?)',
        [exam, bundle_name, bundle_slug, description, image_url]
      );
      return NextResponse.json(
        { id: result.insertId, ...body },
        { status: 201 }
      );
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating test pack or bundle:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}

export async function PUT(request) {
  let conn;
  try {
    const body = await request.json();
    conn = await db.getConnection();

    if (body.type === 'testPack') {
      const {
        id,
        exam,
        test_pack_type,
        title,
        subtitle,
        test_pack_slug,
        is_premium,
        image_url,
        icon_url,
      } = body;
      await conn.query(
        'UPDATE test_packs SET exam = ?, test_pack_type = ?, title = ?, subtitle = ?, test_pack_slug = ?, is_premium = ?, image_url = ?, icon_url = ? WHERE id = ?',
        [
          exam,
          test_pack_type,
          title,
          subtitle,
          test_pack_slug,
          is_premium,
          image_url,
          icon_url,
          id,
        ]
      );
    } else if (body.type === 'bundle') {
      const { id, exam, bundle_name, bundle_slug, description, image_url } =
        body;
      await conn.query(
        'UPDATE test_bundles SET exam = ?, bundle_name = ?, bundle_slug = ?, description = ?, image_url = ? WHERE id = ?',
        [exam, bundle_name, bundle_slug, description, image_url, id]
      );
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating test pack or bundle:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}

export async function DELETE(request) {
  let conn;
  try {
    const body = await request.json();
    conn = await db.getConnection();

    const { id, type } = body;
    if (type === 'testPack') {
      await conn.query('DELETE FROM test_packs WHERE id = ?', [id]);
    } else if (type === 'bundle') {
      await conn.query('DELETE FROM test_bundles WHERE id = ?', [id]);
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting test pack or bundle:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}
