import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query(`
      SELECT st.*, GROUP_CONCAT(stmt.module_test_id) AS module_test_ids
      FROM section_tests st
      LEFT JOIN section_test_module_test stmt ON st.section_test_id = stmt.section_test_id
      GROUP BY st.section_test_id
    `);

    const sectionTests = rows.map((row) => ({
      ...row,
      module_test_ids: row.module_test_ids
        ? row.module_test_ids.split(',')
        : [],
    }));

    return NextResponse.json(sectionTests);
  } catch (error) {
    console.error('Error fetching section tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch section tests' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const {
      sectionTestId,
      testName,
      testSlug,
      numModules,
      difficulty,
      examId,
      sectionId,
      selectedModuleTests,
    } = await request.json();

    const conn = await getConnection();

    // Update section test
    await conn.execute(
      'UPDATE section_tests SET name = ?, slug = ?, num_modules = ?, difficulty = ?, exam_id = ?, section_id = ? WHERE section_test_id = ?',
      [
        testName,
        testSlug,
        numModules,
        difficulty,
        examId,
        sectionId,
        sectionTestId,
      ]
    );

    // Delete existing module test associations
    await conn.execute(
      'DELETE FROM section_test_module_test WHERE section_test_id = ?',
      [sectionTestId]
    );

    // Insert new module test associations
    for (const moduleTestId of selectedModuleTests) {
      await conn.execute(
        'INSERT INTO section_test_module_test (section_test_id, module_test_id) VALUES (?, ?)',
        [sectionTestId, moduleTestId]
      );
    }

    return NextResponse.json({ message: 'Section test updated successfully' });
  } catch (error) {
    console.error('Error updating section test:', error);
    return NextResponse.json(
      { error: 'Failed to update section test' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const sectionTestId = searchParams.get('sectionTestId');

  if (!sectionTestId) {
    return NextResponse.json(
      { error: 'Section test ID is required' },
      { status: 400 }
    );
  }

  try {
    const conn = await getConnection();

    // Delete module test associations
    await conn.execute(
      'DELETE FROM section_test_module_test WHERE section_test_id = ?',
      [sectionTestId]
    );

    // Delete section test
    await conn.execute('DELETE FROM section_tests WHERE section_test_id = ?', [
      sectionTestId,
    ]);

    return NextResponse.json({ message: 'Section test deleted successfully' });
  } catch (error) {
    console.error('Error deleting section test:', error);
    return NextResponse.json(
      { error: 'Failed to delete section test' },
      { status: 500 }
    );
  }
}
