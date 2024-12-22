// app/api/tests/[testId]/metadata/route.js
import { getConnection } from '@/lib/db';

export async function GET(request, { params }) {
  const { testId } = params;
  const pool = await getConnection();

  const [results] = await pool.query(
    `
    SELECT 
      tt.name,
      tt.difficulty,
      m.name as module_name,
      t.name as topic_name
    FROM topic_tests tt
    JOIN moduleid m ON tt.module_id = m.module_id
    JOIN topicid t ON tt.topic_id = t.topic_id
    WHERE tt.topic_test_id = ?
  `,
    [testId]
  );

  return new Response(JSON.stringify(results[0]));
}

// app/api/tests/[testId]/questions/route.js
// import { getConnection } from '@/lib/db';

// export async function GET(request, { params }) {
//   const { testId } = params;
//   const pool = await getConnection();

//   const [results] = await pool.query(
//     `
//     SELECT
//       q.question_id,
//       q.question_text,
//       q.options,
//       q.correct_answer
//     FROM questions q
//     JOIN topic_test_questions ttq ON q.question_id = ttq.question_id
//     WHERE ttq.topic_test_id = ?
//     ORDER BY ttq.question_order
//   `,
//     [testId]
//   );

//   return new Response(JSON.stringify(results));
// }
