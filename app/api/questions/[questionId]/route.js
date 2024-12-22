import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function DELETE(request, { params }) {
  const { questionId } = params;

  try {
    const pool = await getConnection();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Delete associated records
      await connection.query(
        'DELETE FROM gekkoprep.question_exams WHERE question_id = ?',
        [questionId]
      );
      await connection.query(
        'DELETE FROM gekkoprep.question_sections WHERE question_id = ?',
        [questionId]
      );
      await connection.query(
        'DELETE FROM gekkoprep.question_modules WHERE question_id = ?',
        [questionId]
      );
      await connection.query(
        'DELETE FROM gekkoprep.question_topics WHERE question_id = ?',
        [questionId]
      );

      // Delete the question itself
      const [result] = await connection.query(
        'DELETE FROM gekkoprep.questions WHERE question_id = ?',
        [questionId]
      );

      await connection.commit();

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { error: 'Question not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'Question deleted successfully' });
    } catch (dbError) {
      await connection.rollback();
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed', details: dbError.message },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const { questionId } = params;
  const updatedData = await request.json();

  try {
    const pool = await getConnection();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Update the question
      const [result] = await connection.query(
        `UPDATE gekkoprep.questions SET 
         question_content = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?,
         correct_answer = ?, explanation = ?, difficulty = ?
         WHERE question_id = ?`,
        [
          updatedData.question_content,
          updatedData.option_a,
          updatedData.option_b,
          updatedData.option_c,
          updatedData.option_d,
          updatedData.correct_answer,
          updatedData.explanation,
          updatedData.difficulty,
          questionId,
        ]
      );

      // Update associated records
      if (updatedData.exam_ids) {
        await connection.query(
          'DELETE FROM gekkoprep.question_exams WHERE question_id = ?',
          [questionId]
        );
        for (const examId of updatedData.exam_ids) {
          await connection.query(
            'INSERT INTO gekkoprep.question_exams (question_id, exam_id) VALUES (?, ?)',
            [questionId, examId]
          );
        }
      }

      if (updatedData.section_ids) {
        await connection.query(
          'DELETE FROM gekkoprep.question_sections WHERE question_id = ?',
          [questionId]
        );
        for (const sectionId of updatedData.section_ids) {
          await connection.query(
            'INSERT INTO gekkoprep.question_sections (question_id, section_id) VALUES (?, ?)',
            [questionId, sectionId]
          );
        }
      }

      if (updatedData.module_ids) {
        await connection.query(
          'DELETE FROM gekkoprep.question_modules WHERE question_id = ?',
          [questionId]
        );
        for (const moduleId of updatedData.module_ids) {
          await connection.query(
            'INSERT INTO gekkoprep.question_modules (question_id, module_id) VALUES (?, ?)',
            [questionId, moduleId]
          );
        }
      }

      if (updatedData.topic_ids) {
        await connection.query(
          'DELETE FROM gekkoprep.question_topics WHERE question_id = ?',
          [questionId]
        );
        for (const topicId of updatedData.topic_ids) {
          await connection.query(
            'INSERT INTO gekkoprep.question_topics (question_id, topic_id) VALUES (?, ?)',
            [questionId, topicId]
          );
        }
      }

      await connection.commit();

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { error: 'Question not found or no changes made' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'Question updated successfully' });
    } catch (dbError) {
      await connection.rollback();
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed', details: dbError.message },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question', details: error.message },
      { status: 500 }
    );
  }
}
