import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const topicTestId = searchParams.get('topicTestId');

  try {
    const conn = await getConnection();
    let query, values;

    if (topicTestId) {
      // Fetch a specific topic test
      query = `
        SELECT tt.*, GROUP_CONCAT(ttq.question_id) as question_ids
        FROM topic_tests tt
        LEFT JOIN topic_test_questions ttq ON tt.topic_test_id = ttq.topic_test_id
        WHERE tt.topic_test_id = ?
        GROUP BY tt.topic_test_id
      `;
      values = [topicTestId];
    } else {
      // Fetch all topic tests
      query = `
        SELECT tt.*, GROUP_CONCAT(ttq.question_id) as question_ids
        FROM topic_tests tt
        LEFT JOIN topic_test_questions ttq ON tt.topic_test_id = ttq.topic_test_id
        GROUP BY tt.topic_test_id
      `;
      values = [];
    }

    const [rows] = await conn.query(query, values);

    const topicTests = rows.map((row) => ({
      ...row,
      question_ids: row.question_ids ? row.question_ids.split(',') : [],
    }));

    return NextResponse.json(topicTestId ? topicTests[0] : topicTests);
  } catch (error) {
    console.error('Error fetching topic tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topic tests', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const {
      topicTestId,
      testName,
      testSlug,
      numQuestions,
      duration_minutes, // Add this
      difficulty,
      examId,
      sectionId,
      moduleId,
      topicId,
      selectedQuestions,
    } = await request.json();

    const conn = await getConnection();

    // Update the topic test with duration
    await conn.execute(
      `UPDATE topic_tests 
       SET name = ?, slug = ?, num_questions = ?, duration_minutes = ?,
           difficulty = ?, exam_id = ?, section_id = ?, module_id = ?, 
           topic_id = ? 
       WHERE topic_test_id = ?`,
      [
        testName,
        testSlug,
        numQuestions,
        duration_minutes, // Add this
        difficulty,
        examId,
        sectionId,
        moduleId,
        topicId,
        topicTestId,
      ]
    );

    // Delete existing question associations
    await conn.execute(
      'DELETE FROM topic_test_questions WHERE topic_test_id = ?',
      [topicTestId]
    );

    // Insert new question associations
    for (const questionId of selectedQuestions) {
      await conn.execute(
        'INSERT INTO topic_test_questions (topic_test_id, question_id) VALUES (?, ?)',
        [topicTestId, questionId]
      );
    }

    return NextResponse.json({ message: 'Topic test updated successfully' });
  } catch (error) {
    console.error('Error updating topic test:', error);
    return NextResponse.json(
      { error: 'Failed to update topic test', details: error.message },
      { status: 500 }
    );
  }
}
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const topicTestId = searchParams.get('topicTestId');

  if (!topicTestId) {
    return NextResponse.json(
      { error: 'Topic test ID is required' },
      { status: 400 }
    );
  }

  try {
    const conn = await getConnection();

    // Delete question associations
    await conn.execute(
      'DELETE FROM topic_test_questions WHERE topic_test_id = ?',
      [topicTestId]
    );

    // Delete the topic test
    await conn.execute('DELETE FROM topic_tests WHERE topic_test_id = ?', [
      topicTestId,
    ]);

    return NextResponse.json({ message: 'Topic test deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic test:', error);
    return NextResponse.json(
      { error: 'Failed to delete topic test', details: error.message },
      { status: 500 }
    );
  }
}
