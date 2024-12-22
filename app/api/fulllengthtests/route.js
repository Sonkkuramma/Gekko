import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const examId = searchParams.get('examId');
  const difficulty = searchParams.get('difficulty');

  try {
    const conn = await getConnection();

    let query = `
      SELECT 
        section_test_id, 
        name, 
        difficulty,
        num_modules
      FROM section_tests
      WHERE exam_id = ? AND difficulty = ?
    `;

    const [rows] = await conn.query(query, [examId, difficulty]);

    const sectionTests = rows.map((row) => ({
      section_test_id: row.section_test_id,
      name: row.name,
      difficulty: row.difficulty,
      num_modules: row.num_modules,
    }));

    return NextResponse.json({ sectionTests });
  } catch (error) {
    console.error('Error fetching section tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch section tests', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const {
      testName,
      testSlug,
      numSections,
      difficulty,
      examId,
      selectedSectionTests,
    } = await request.json();

    const conn = await getConnection();

    // Generate a unique 4-character fulllength_test_id
    const [existingIds] = await conn.query(
      'SELECT fulllength_test_id FROM fulllength_tests'
    );
    let fullLengthTestId;
    do {
      fullLengthTestId = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();
    } while (
      existingIds.some((row) => row.fulllength_test_id === fullLengthTestId)
    );

    // Insert the new full-length test
    await conn.execute(
      'INSERT INTO fulllength_tests (fulllength_test_id, name, slug, num_sections, difficulty, exam_id) VALUES (?, ?, ?, ?, ?, ?)',
      [fullLengthTestId, testName, testSlug, numSections, difficulty, examId]
    );

    // Associate section tests with the full-length test
    for (const sectionTestId of selectedSectionTests) {
      await conn.execute(
        'INSERT INTO fulllength_test_section_test (fulllength_test_id, section_test_id) VALUES (?, ?)',
        [fullLengthTestId, sectionTestId]
      );
    }

    return NextResponse.json(
      { message: 'Full-length test created successfully', fullLengthTestId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating full-length test:', error);
    return NextResponse.json(
      { error: 'Failed to create full-length test', details: error.message },
      { status: 500 }
    );
  }
}
