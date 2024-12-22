// app/api/tests/[testId]/progress/route.js
import { getAuth } from '@clerk/nextjs/server';
import { getConnection } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { userId } = getAuth(request);
    const { sessionId, currentQuestionIndex, status } = await request.json();

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getConnection();

    await pool.execute(
      `
      UPDATE test_sessions
      SET 
        current_question_index = ?,
        status = ?,
        last_activity_time = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `,
      [currentQuestionIndex, status, sessionId, userId]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error('Progress update failed:', error);
    return Response.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
