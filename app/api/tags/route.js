import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getConnection();
    const [rows] = await pool.query('SELECT * FROM tags ORDER BY tag_id');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { tagName } = await request.json();
    console.log('Received request to add tag:', tagName);

    if (!tagName || tagName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    const [result] = await pool.query(
      'INSERT INTO tags (tag_name) VALUES (?)',
      [tagName.trim()]
    );
    console.log('Insert result:', result);

    if (result.affectedRows !== 1) {
      throw new Error('Failed to insert tag');
    }

    const [newTag] = await pool.query('SELECT * FROM tags WHERE tag_id = ?', [
      result.insertId,
    ]);
    console.log('New tag:', newTag[0]);

    return NextResponse.json(newTag[0]);
  } catch (error) {
    console.error('Error adding tag:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tagId');

    if (!tagId || isNaN(parseInt(tagId))) {
      return NextResponse.json({ error: 'Invalid tag ID' }, { status: 400 });
    }

    const pool = await getConnection();
    const [result] = await pool.query('DELETE FROM tags WHERE tag_id = ?', [
      parseInt(tagId),
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
