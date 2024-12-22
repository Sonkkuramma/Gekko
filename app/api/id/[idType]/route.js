import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

// Helper function to generate a unique 4-character ID
async function generateUniqueId(conn, table, idField) {
  while (true) {
    const id = Math.random().toString(36).substring(2, 6).toUpperCase();
    const [existing] = await conn.query(
      `SELECT ${idField} FROM ${table} WHERE ${idField} = ?`,
      [id]
    );
    if (existing.length === 0) {
      return id;
    }
  }
}

export async function GET(request, { params }) {
  const idType = params.idType;

  const conn = await getConnection();
  let query;

  switch (idType) {
    case 'topic':
      query = 'SELECT * FROM topicid';
      break;
    case 'module':
      query = 'SELECT * FROM moduleid';
      break;
    case 'section':
      query = 'SELECT * FROM sectionid';
      break;
    case 'exam':
      query = 'SELECT * FROM examid';
      break;
    default:
      return NextResponse.json({ error: 'Invalid ID type' }, { status: 400 });
  }

  try {
    const [rows] = await conn.query(query);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  const idType = params.idType;
  const data = await request.json();

  const conn = await getConnection();
  let query;
  let values;
  let id;

  switch (idType) {
    case 'topic':
      id = await generateUniqueId(conn, 'topicid', 'topic_id');
      query =
        'INSERT INTO topicid (topic_id, name, exam_id, module_id, section_id) VALUES (?, ?, ?, ?, ?)';
      values = [id, data.name, data.exam_id, data.module_id, data.section_id];
      break;
    case 'module':
      id = await generateUniqueId(conn, 'moduleid', 'module_id');
      query =
        'INSERT INTO moduleid (module_id, name, exam_id, section_id) VALUES (?, ?, ?, ?)';
      values = [id, data.name, data.exam_id, data.section_id];
      break;
    case 'section':
      id = await generateUniqueId(conn, 'sectionid', 'section_id');
      query =
        'INSERT INTO sectionid (section_id, name, exam_id) VALUES (?, ?, ?)';
      values = [id, data.name, data.exam_id];
      break;
    case 'exam':
      id = await generateUniqueId(conn, 'examid', 'exam_id');
      query = 'INSERT INTO examid (exam_id, name) VALUES (?, ?)';
      values = [id, data.name];
      break;
    default:
      return NextResponse.json({ error: 'Invalid ID type' }, { status: 400 });
  }

  try {
    await conn.query(query, values);
    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error('Error inserting data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const idType = params.idType;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const data = await request.json();

  const conn = await getConnection();
  let query;
  let values;

  switch (idType) {
    case 'topic':
      query =
        'UPDATE topicid SET name = ?, exam_id = ?, module_id = ?, section_id = ? WHERE topic_id = ?';
      values = [data.name, data.exam_id, data.module_id, data.section_id, id];
      break;
    case 'module':
      query =
        'UPDATE moduleid SET name = ?, exam_id = ?, section_id = ? WHERE module_id = ?';
      values = [data.name, data.exam_id, data.section_id, id];
      break;
    case 'section':
      query = 'UPDATE sectionid SET name = ?, exam_id = ? WHERE section_id = ?';
      values = [data.name, data.exam_id, id];
      break;
    case 'exam':
      query = 'UPDATE examid SET name = ? WHERE exam_id = ?';
      values = [data.name, id];
      break;
    default:
      return NextResponse.json({ error: 'Invalid ID type' }, { status: 400 });
  }

  try {
    await conn.query(query, values);
    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error('Error updating data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const idType = params.idType;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const conn = await getConnection();
  let query;

  switch (idType) {
    case 'topic':
      query = 'DELETE FROM topicid WHERE topic_id = ?';
      break;
    case 'module':
      query = 'DELETE FROM moduleid WHERE module_id = ?';
      break;
    case 'section':
      query = 'DELETE FROM sectionid WHERE section_id = ?';
      break;
    case 'exam':
      query = 'DELETE FROM examid WHERE exam_id = ?';
      break;
    default:
      return NextResponse.json({ error: 'Invalid ID type' }, { status: 400 });
  }

  try {
    await conn.query(query, [id]);
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
