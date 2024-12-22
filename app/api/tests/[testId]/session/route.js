// app/api/tests/[testId]/session/route.js
import { getAuth } from '@clerk/nextjs/server';
import { getConnection } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { userId } = getAuth(request);
    const { testId, testType } = await request.json(); // Get testId from request body instead of params

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!testId || testId.length !== 4) {
      return Response.json(
        { error: 'Invalid test ID. Must be exactly 4 characters.' },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    // Check for existing active session
    const [result] = await pool.execute(
      `
      INSERT INTO test_sessions (
        user_id,
        test_id,
        test_type,
        start_time,
        last_activity_time,
        status,
        current_question_index
      ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'in_progress', 0)
    `,
      [userId, testId, testType]
    );

    return Response.json({
      sessionId: result.insertId,
      currentQuestion: 0,
      status: 'in_progress',
    });
  } catch (error) {
    console.error('Session creation failed:', error);
    return Response.json(
      { error: 'Failed to create session', details: error.message },
      { status: 500 }
    );
  }
}
