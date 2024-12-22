// File: app/api/moduletests/manager/route.js

import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const moduleTestId = searchParams.get('moduleTestId');

  try {
    const conn = await getConnection();
    let query, values;

    if (moduleTestId) {
      // Fetch a specific module test
      query = `
        SELECT mt.*, GROUP_CONCAT(mtq.question_id) as question_ids
        FROM module_tests mt
        LEFT JOIN module_test_questions mtq ON mt.module_test_id = mtq.module_test_id
        WHERE mt.module_test_id = ?
        GROUP BY mt.module_test_id
      `;
      values = [moduleTestId];
    } else {
      // Fetch all module tests
      query = `
        SELECT mt.*, GROUP_CONCAT(mtq.question_id) as question_ids
        FROM module_tests mt
        LEFT JOIN module_test_questions mtq ON mt.module_test_id = mtq.module_test_id
        GROUP BY mt.module_test_id
      `;
      values = [];
    }

    const [rows] = await conn.query(query, values);

    const moduleTests = rows.map((row) => ({
      ...row,
      question_ids: row.question_ids ? row.question_ids.split(',') : [],
    }));

    return NextResponse.json(moduleTestId ? moduleTests[0] : moduleTests);
  } catch (error) {
    console.error('Error fetching module tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch module tests', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const {
      moduleTestId,
      testName,
      testSlug,
      numQuestions,
      duration_minutes,
      difficulty,
      examId,
      sectionId,
      moduleId,
      selectedQuestions,
    } = await request.json();

    const conn = await getConnection();

    // Update the module test
    await conn.execute(
      `UPDATE module_tests 
       SET name = ?, 
           slug = ?, 
           num_questions = ?, 
           duration_minutes = ?,
           difficulty = ?, 
           exam_id = ?, 
           section_id = ?, 
           module_id = ? 
       WHERE module_test_id = ?`,
      [
        testName,
        testSlug,
        numQuestions,
        duration_minutes,
        difficulty,
        examId,
        sectionId,
        moduleId,
        moduleTestId,
      ]
    );

    // Delete existing question associations
    await conn.execute(
      'DELETE FROM module_test_questions WHERE module_test_id = ?',
      [moduleTestId]
    );

    // Insert new question associations
    for (const questionId of selectedQuestions) {
      await conn.execute(
        'INSERT INTO module_test_questions (module_test_id, question_id) VALUES (?, ?)',
        [moduleTestId, questionId]
      );
    }

    return NextResponse.json({ message: 'Module test updated successfully' });
  } catch (error) {
    console.error('Error updating module test:', error);
    return NextResponse.json(
      {
        error: 'Failed to update module test',
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const moduleTestId = searchParams.get('moduleTestId');

  if (!moduleTestId) {
    return NextResponse.json(
      { error: 'Module test ID is required' },
      { status: 400 }
    );
  }

  try {
    const conn = await getConnection();

    // Delete question associations first due to foreign key constraint
    await conn.execute(
      'DELETE FROM module_test_questions WHERE module_test_id = ?',
      [moduleTestId]
    );

    // Then delete the module test
    await conn.execute('DELETE FROM module_tests WHERE module_test_id = ?', [
      moduleTestId,
    ]);

    return NextResponse.json({ message: 'Module test deleted successfully' });
  } catch (error) {
    console.error('Error deleting module test:', error);
    return NextResponse.json(
      { error: 'Failed to delete module test', details: error.message },
      { status: 500 }
    );
  }
}
