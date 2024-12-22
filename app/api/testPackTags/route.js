import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getConnection();
    const [rows] = await pool.query(
      'SELECT test_pack_id, tag_id FROM test_pack_tag_association'
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching test pack tags:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
