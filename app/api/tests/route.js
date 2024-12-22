// app/api/tests/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const packType = searchParams.get('packType');
  const examId = searchParams.get('examId');

  console.log('Received request with packType:', packType, 'examId:', examId);

  if (!packType || !examId) {
    console.error('Missing required parameters');
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const conn = await getConnection();
    let query;
    let params;

    switch (packType) {
      case 'section tests':
        query = `
          SELECT 
            st.section_test_id as id,
            st.name,
            st.num_modules as num_questions,
            st.difficulty,
            st.exam_id,
            GROUP_CONCAT(mt.module_test_id) as module_test_ids
          FROM section_tests st
          LEFT JOIN section_test_module_test stmt ON st.section_test_id = stmt.section_test_id
          LEFT JOIN module_tests mt ON stmt.module_test_id = mt.module_test_id
          WHERE st.exam_id = ?
          GROUP BY st.section_test_id
        `;
        break;

      case 'module tests':
        query = `
          SELECT 
            module_test_id as id,
            name,
            num_questions,
            difficulty,
            exam_id
          FROM module_tests 
          WHERE exam_id = ?
        `;
        break;

      case 'topic tests':
        query = `
          SELECT 
            topic_test_id as id,
            name,
            num_questions,
            difficulty,
            exam_id
          FROM topic_tests 
          WHERE exam_id = ?
        `;
        break;

      case 'fulllength tests':
        query = `
          SELECT 
            fulllength_test_id as id,
            name,
            num_sections as num_questions,
            difficulty,
            exam_id
          FROM fulllength_tests 
          WHERE exam_id = ?
        `;
        break;

      default:
        console.error('Invalid pack type:', packType);
        return NextResponse.json(
          { error: 'Invalid pack type' },
          { status: 400 }
        );
    }

    console.log('Executing query:', query, 'with examId:', examId);
    const [rows] = await conn.query(query, [examId]);
    console.log('Query results:', rows);

    // Process the results
    const processedRows = rows.map((row) => ({
      ...row,
      module_test_ids: row.module_test_ids
        ? row.module_test_ids.split(',')
        : [],
    }));

    return NextResponse.json(processedRows);
  } catch (error) {
    console.error('Error fetching available tests:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch available tests',
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
