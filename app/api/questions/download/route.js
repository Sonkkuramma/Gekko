// File: app/api/questions/download/route.js

import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getConnection();
    const [questions] = await pool.query(`
      SELECT 
  q.*,
  GROUP_CONCAT(DISTINCT qe.exam_id) as exams,
  GROUP_CONCAT(DISTINCT qm.module_id) as modules,
  GROUP_CONCAT(DISTINCT qs.section_id) as sections,
  GROUP_CONCAT(DISTINCT qt.topic_id) as topics
FROM test_pack_management_lama.questions q
LEFT JOIN test_pack_management_lama.question_exams qe ON q.question_id = qe.question_id
LEFT JOIN test_pack_management_lama.question_modules qm ON q.question_id = qm.question_id
LEFT JOIN test_pack_management_lama.question_sections qs ON q.question_id = qs.question_id
LEFT JOIN test_pack_management_lama.question_topics qt ON q.question_id = qt.question_id
GROUP BY q.id
 `);

    const processedQuestions = questions.map((q) => ({
      ...q,
      exams: q.exams ? q.exams.split(',') : [],
      modules: q.modules ? q.modules.split(',') : [],
      sections: q.sections ? q.sections.split(',') : [],
      topics: q.topics ? q.topics.split(',') : [],
    }));

    return new NextResponse(JSON.stringify(processedQuestions), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=questions.json',
      },
    });
  } catch (error) {
    console.error('Error downloading questions:', error);
    return NextResponse.json(
      { error: 'Failed to download questions', details: error.message },
      { status: 500 }
    );
  }
}
