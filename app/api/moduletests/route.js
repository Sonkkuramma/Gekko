// File: app/api/moduletests/route.js

import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const examIds = searchParams.get('examIds')?.split(',') || [];
  const sectionIds = searchParams.get('sectionIds')?.split(',') || [];
  const moduleIds = searchParams.get('moduleIds')?.split(',') || [];
  const difficulties = searchParams.get('difficulties')?.split(',') || [];

  try {
    const conn = await getConnection();

    let query = `
      SELECT DISTINCT 
        q.question_id, 
        q.question_content, 
        q.difficulty,
        q.option_a, 
        q.option_b, 
        q.option_c, 
        q.option_d, 
        q.correct_answer, 
        q.explanation,
        GROUP_CONCAT(DISTINCT qe.exam_id) as exam_ids,
        GROUP_CONCAT(DISTINCT qs.section_id) as section_ids,
        GROUP_CONCAT(DISTINCT qm.module_id) as module_ids
      FROM questions q
      LEFT JOIN question_exams qe ON q.question_id = qe.question_id
      LEFT JOIN question_sections qs ON q.question_id = qs.question_id
      LEFT JOIN question_modules qm ON q.question_id = qm.question_id
      WHERE 1=1
    `;

    const conditions = [];
    const values = [];

    if (examIds.length > 0) {
      conditions.push('qe.exam_id IN (?)');
      values.push(examIds);
    }
    if (sectionIds.length > 0) {
      conditions.push('qs.section_id IN (?)');
      values.push(sectionIds);
    }
    if (moduleIds.length > 0) {
      conditions.push('qm.module_id IN (?)');
      values.push(moduleIds);
    }
    if (difficulties.length > 0) {
      conditions.push('q.difficulty IN (?)');
      values.push(difficulties);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' GROUP BY q.question_id';

    const [rows] = await conn.query(query, values);

    const questions = rows.map((row) => ({
      question_id: row.question_id,
      content: row.question_content,
      difficulty: row.difficulty,
      option_a: row.option_a,
      option_b: row.option_b,
      option_c: row.option_c,
      option_d: row.option_d,
      correct_answer: row.correct_answer,
      explanation: row.explanation,
      exam_ids: row.exam_ids?.split(',') || [],
      section_ids: row.section_ids?.split(',') || [],
      module_ids: row.module_ids?.split(',') || [],
    }));

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const {
      testName,
      testSlug,
      numQuestions,
      duration_minutes, // Add this
      difficulty,
      examId,
      sectionId,
      moduleId,
      selectedQuestions,
    } = await request.json();

    const conn = await getConnection();

    // Generate a unique 4-character module_test_id
    const [existingIds] = await conn.query(
      'SELECT module_test_id FROM module_tests'
    );
    let moduleTestId;
    do {
      moduleTestId = Math.random().toString(36).substring(2, 6).toUpperCase();
    } while (existingIds.some((row) => row.module_test_id === moduleTestId));

    // Insert the new module test
    await conn.execute(
      `INSERT INTO module_tests (
        module_test_id, name, slug, num_questions, duration_minutes, 
        difficulty, exam_id, section_id, module_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        moduleTestId,
        testName,
        testSlug,
        numQuestions,
        duration_minutes, // Add this
        difficulty,
        examId,
        sectionId,
        moduleId,
      ]
    );

    // Associate questions with the module test
    for (const questionId of selectedQuestions) {
      await conn.execute(
        'INSERT INTO module_test_questions (module_test_id, question_id) VALUES (?, ?)',
        [moduleTestId, questionId]
      );
    }

    return NextResponse.json(
      { message: 'Module test created successfully', moduleTestId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating module test:', error);
    return NextResponse.json(
      { error: 'Failed to create module test', details: error.message },
      { status: 500 }
    );
  }
}
