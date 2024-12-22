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
  try {
    const data = await request.json();
    const conn = await getConnection();

    // Generate a unique pack_id
    let pack_id;
    let isUnique = false;
    while (!isUnique) {
      pack_id = generateBundleId();
      const [existing] = await conn.query(
        'SELECT pack_id FROM test_packs WHERE pack_id = ?',
        [pack_id]
      );
      if (existing.length === 0) {
        isUnique = true;
      }
    }

    // Insert the new test pack into the database
    const [result] = await conn.query(
      `INSERT INTO test_packs 
       (pack_id, exam_id, pack_type, pack_name, pack_slug, pack_short_description, 
        pack_long_description, is_premium, pack_image_url, pack_banner_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pack_id,
        data.exam_id,
        data.pack_type,
        data.pack_name,
        data.pack_slug,
        data.pack_short_description,
        data.pack_long_description,
        data.is_premium,
        data.pack_image_url,
        data.pack_banner_url,
      ]
    );

    if (result.affectedRows === 1) {
      return NextResponse.json({
        message: 'Test pack created successfully',
        data: { ...data, pack_id },
      });
    } else {
      throw new Error('Failed to insert test pack');
    }
  } catch (error) {
    console.error('Error creating test pack:', error);
    return NextResponse.json(
      { error: 'Failed to create test pack: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'getExams') {
    return getExams();
  } else {
    return getTestPacks();
  }
}

async function getExams() {
  console.log('Fetching exams...');
  try {
    const conn = await getConnection();
    const [rows] = await conn.query('SELECT * FROM examid');
    console.log('Fetched exams:', rows);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exams' },
      { status: 500 }
    );
  }
}

async function getTestPacks() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query(`
      SELECT 
        pack_id, exam_id, pack_type, pack_name, pack_slug, 
        pack_short_description, pack_long_description, 
        is_premium, pack_image_url, pack_banner_url
      FROM test_packs
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching test packs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test packs' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const conn = await getConnection();

    const [result] = await conn.query(
      `UPDATE test_packs SET 
       exam_id = ?, pack_type = ?, pack_name = ?, pack_slug = ?, 
       pack_short_description = ?, pack_long_description = ?, 
       is_premium = ?, pack_image_url = ?, pack_banner_url = ? 
       WHERE pack_id = ?`,
      [
        data.exam_id,
        data.pack_type,
        data.pack_name,
        data.pack_slug,
        data.pack_short_description,
        data.pack_long_description,
        data.is_premium,
        data.pack_image_url,
        data.pack_banner_url,
        data.pack_id,
      ]
    );

    if (result.affectedRows === 1) {
      return NextResponse.json({
        message: 'Test pack updated successfully',
        data: data,
      });
    } else {
      throw new Error('Failed to update test pack');
    }
  } catch (error) {
    console.error('Error updating test pack:', error);
    return NextResponse.json(
      { error: 'Failed to update test pack: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const packId = searchParams.get('packId');

    if (!packId) {
      return NextResponse.json(
        { error: 'Pack ID is required' },
        { status: 400 }
      );
    }

    const conn = await getConnection();
    const [result] = await conn.query(
      'DELETE FROM test_packs WHERE pack_id = ?',
      [packId]
    );

    if (result.affectedRows === 1) {
      return NextResponse.json({
        message: 'Test pack deleted successfully',
      });
    } else {
      throw new Error('Failed to delete test pack');
    }
  } catch (error) {
    console.error('Error deleting test pack:', error);
    return NextResponse.json(
      { error: 'Failed to delete test pack: ' + error.message },
      { status: 500 }
    );
  }
}
