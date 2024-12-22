import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const examId = searchParams.get('examId');
  const sectionId = searchParams.get('sectionId');
  const difficulty = searchParams.get('difficulty');

  try {
    const conn = await getConnection();

    let query = `
      SELECT 
        module_test_id, 
        name, 
        difficulty,
        num_questions
      FROM module_tests
      WHERE exam_id = ? AND section_id = ? AND difficulty = ?
    `;

    const [rows] = await conn.query(query, [examId, sectionId, difficulty]);

    const moduleTests = rows.map((row) => ({
      module_test_id: row.module_test_id,
      name: row.name,
      difficulty: row.difficulty,
      num_questions: row.num_questions,
    }));

    return NextResponse.json({ moduleTests });
  } catch (error) {
    console.error('Error fetching module tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch module tests', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const {
      testName,
      testSlug,
      numModules,
      difficulty,
      examId,
      sectionId,
      selectedModuleTests,
    } = await request.json();

    const conn = await getConnection();

    // Generate a unique 4-character section_test_id
    const [existingIds] = await conn.query(
      'SELECT section_test_id FROM section_tests'
    );
    let sectionTestId;
    do {
      sectionTestId = Math.random().toString(36).substring(2, 6).toUpperCase();
    } while (existingIds.some((row) => row.section_test_id === sectionTestId));

    // Insert the new section test
    await conn.execute(
      'INSERT INTO section_tests (section_test_id, name, slug, num_modules, difficulty, exam_id, section_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        sectionTestId,
        testName,
        testSlug,
        numModules,
        difficulty,
        examId,
        sectionId,
      ]
    );

    // Associate module tests with the section test
    for (const moduleTestId of selectedModuleTests) {
      await conn.execute(
        'INSERT INTO section_test_module_test (section_test_id, module_test_id) VALUES (?, ?)',
        [sectionTestId, moduleTestId]
      );
    }

    return NextResponse.json(
      { message: 'Section test created successfully', sectionTestId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating section test:', error);
    return NextResponse.json(
      { error: 'Failed to create section test', details: error.message },
      { status: 500 }
    );
  }
}
