// File: app/api/fulllengthtests/manager/route.js

import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query(`
      SELECT ft.*, GROUP_CONCAT(ftst.section_test_id) AS section_test_ids
      FROM fulllength_tests ft
      LEFT JOIN fulllength_test_section_test ftst ON ft.fulllength_test_id = ftst.fulllength_test_id
      GROUP BY ft.fulllength_test_id
    `);

    const fullLengthTests = rows.map((row) => ({
      ...row,
      section_test_ids: row.section_test_ids
        ? row.section_test_ids.split(',')
        : [],
    }));

    return NextResponse.json(fullLengthTests);
  } catch (error) {
    console.error('Error fetching full-length tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch full-length tests' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const {
      fullLengthTestId,
      testName,
      testSlug,
      numSections,
      difficulty,
      examId,
      selectedSectionTests,
    } = await request.json();

    const conn = await getConnection();

    // Update full-length test
    await conn.execute(
      'UPDATE fulllength_tests SET name = ?, slug = ?, num_sections = ?, difficulty = ?, exam_id = ? WHERE fulllength_test_id = ?',
      [testName, testSlug, numSections, difficulty, examId, fullLengthTestId]
    );

    // Delete existing section test associations
    await conn.execute(
      'DELETE FROM fulllength_test_section_test WHERE fulllength_test_id = ?',
      [fullLengthTestId]
    );

    // Insert new section test associations
    for (const sectionTestId of selectedSectionTests) {
      await conn.execute(
        'INSERT INTO fulllength_test_section_test (fulllength_test_id, section_test_id) VALUES (?, ?)',
        [fullLengthTestId, sectionTestId]
      );
    }

    return NextResponse.json({
      message: 'Full-length test updated successfully',
    });
  } catch (error) {
    console.error('Error updating full-length test:', error);
    return NextResponse.json(
      { error: 'Failed to update full-length test' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const fullLengthTestId = searchParams.get('fullLengthTestId');

  if (!fullLengthTestId) {
    return NextResponse.json(
      { error: 'Full-length test ID is required' },
      { status: 400 }
    );
  }

  try {
    const conn = await getConnection();

    // Delete section test associations
    await conn.execute(
      'DELETE FROM fulllength_test_section_test WHERE fulllength_test_id = ?',
      [fullLengthTestId]
    );

    // Delete full-length test
    await conn.execute(
      'DELETE FROM fulllength_tests WHERE fulllength_test_id = ?',
      [fullLengthTestId]
    );

    return NextResponse.json({
      message: 'Full-length test deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting full-length test:', error);
    return NextResponse.json(
      { error: 'Failed to delete full-length test' },
      { status: 500 }
    );
  }
}
