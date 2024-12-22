// File: app/api/questions/route.js

import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;
  const offset = (page - 1) * limit;

  try {
    const pool = await getConnection();
    const connection = await pool.getConnection();

    try {
      // Get total count of questions
      const [countResult] = await connection.query(
        'SELECT COUNT(*) as total FROM gekkoprep.questions'
      );
      const totalQuestions = countResult[0].total;

      // Fetch questions with pagination
      const [questions] = await connection.query(
        `SELECT q.*, 
          GROUP_CONCAT(DISTINCT qe.exam_id) as exam_ids,
          GROUP_CONCAT(DISTINCT qs.section_id) as section_ids,
          GROUP_CONCAT(DISTINCT qm.module_id) as module_ids,
          GROUP_CONCAT(DISTINCT qt.topic_id) as topic_ids
        FROM gekkoprep.questions q
        LEFT JOIN gekkoprep.question_exams qe ON q.question_id = qe.question_id
        LEFT JOIN gekkoprep.question_sections qs ON q.question_id = qs.question_id
        LEFT JOIN gekkoprep.question_modules qm ON q.question_id = qm.question_id
        LEFT JOIN gekkoprep.question_topics qt ON q.question_id = qt.question_id
        GROUP BY q.id
        LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      // Process the questions to split the concatenated IDs into arrays
      const processedQuestions = questions.map((q) => ({
        ...q,
        exam_ids: q.exam_ids ? q.exam_ids.split(',') : [],
        section_ids: q.section_ids ? q.section_ids.split(',') : [],
        module_ids: q.module_ids ? q.module_ids.split(',') : [],
        topic_ids: q.topic_ids ? q.topic_ids.split(',') : [],
      }));

      return NextResponse.json({
        questions: processedQuestions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalQuestions / limit),
          totalQuestions,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Received body:', body);

    const {
      question_content,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      explanation,
      difficulty,
      exam_ids,
      section_ids,
      module_ids,
      topic_ids,
    } = body;

    // Validate input
    const requiredFields = {
      question_content,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      explanation,
      difficulty,
      exam_ids,
      section_ids,
      module_ids,
      topic_ids,
    };
    const missingFields = Object.keys(requiredFields).filter(
      (key) => !requiredFields[key] || requiredFields[key].length === 0
    );

    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return NextResponse.json(
        { error: 'All fields are required', missingFields },
        { status: 400 }
      );
    }

    // Generate a random 8-character question ID
    const question_id = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    const pool = await getConnection();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Insert the question
      const [result] = await connection.query(
        `INSERT INTO gekkoprep.questions 
         (question_id, question_content, option_a, option_b, option_c, option_d, 
          correct_answer, explanation, difficulty) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          question_id,
          question_content,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer,
          explanation,
          difficulty,
        ]
      );

      // Insert exam associations
      for (const exam_id of exam_ids) {
        await connection.query(
          'INSERT INTO gekkoprep.question_exams (question_id, exam_id) VALUES (?, ?)',
          [question_id, exam_id]
        );
      }

      // Insert section associations
      for (const section_id of section_ids) {
        await connection.query(
          'INSERT INTO gekkoprep.question_sections (question_id, section_id) VALUES (?, ?)',
          [question_id, section_id]
        );
      }

      // Insert module associations
      for (const module_id of module_ids) {
        await connection.query(
          'INSERT INTO gekkoprep.question_modules (question_id, module_id) VALUES (?, ?)',
          [question_id, module_id]
        );
      }

      // Insert topic associations
      for (const topic_id of topic_ids) {
        await connection.query(
          'INSERT INTO gekkoprep.question_topics (question_id, topic_id) VALUES (?, ?)',
          [question_id, topic_id]
        );
      }

      await connection.commit();

      console.log('Question created successfully:', result);
      return NextResponse.json({
        message: 'Question created successfully',
        questionId: question_id,
      });
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
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question', details: error.message },
      { status: 500 }
    );
  }
}
