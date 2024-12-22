import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST(request) {
  try {
    const questions = await request.json();
    const conn = await getConnection();

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input. Expected a non-empty array of questions.' },
        { status: 400 }
      );
    }

    const insertedQuestions = [];

    for (const question of questions) {
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
      } = question;

      // Validate required fields
      if (!question_content || !correct_answer || !difficulty) {
        throw new Error('Missing required fields in question data');
      }

      // Generate a random 8-character question ID
      const question_id = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

      const [result] = await conn.query(
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

      if (exam_ids && Array.isArray(exam_ids)) {
        for (const exam_id of exam_ids) {
          await conn.query(
            'INSERT INTO gekkoprep.question_exams (question_id, exam_id) VALUES (?, ?)',
            [question_id, exam_id]
          );
        }
      }

      if (section_ids && Array.isArray(section_ids)) {
        for (const section_id of section_ids) {
          await conn.query(
            'INSERT INTO gekkoprep.question_sections (question_id, section_id) VALUES (?, ?)',
            [question_id, section_id]
          );
        }
      }

      if (module_ids && Array.isArray(module_ids)) {
        for (const module_id of module_ids) {
          await conn.query(
            'INSERT INTO gekkoprep.question_modules (question_id, module_id) VALUES (?, ?)',
            [question_id, module_id]
          );
        }
      }

      if (topic_ids && Array.isArray(topic_ids)) {
        for (const topic_id of topic_ids) {
          await conn.query(
            'INSERT INTO gekkoprep.question_topics (question_id, topic_id) VALUES (?, ?)',
            [question_id, topic_id]
          );
        }
      }

      insertedQuestions.push({ question_id, ...question });
    }

    return NextResponse.json(
      {
        message: 'Questions uploaded successfully',
        count: insertedQuestions.length,
        insertedQuestions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading questions:', error);
    return NextResponse.json(
      { message: 'Error uploading questions', error: error.message },
      { status: 500 }
    );
  }
}
