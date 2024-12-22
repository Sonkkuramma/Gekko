// app/api/tests/[testId]/complete/route.js
import { getAuth } from '@clerk/nextjs/server';
import { getConnection } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { userId } = getAuth(request);
    const { sessionId } = await request.json();

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getConnection();

    // First get the distinct questions and their latest responses
    const [questionDetails] = await pool.query(
      `
      WITH RankedResponses AS (
        SELECT 
          qr.question_id,
          qr.selected_answer,
          qr.is_correct,
          qr.is_skipped,
          qr.time_spent,
          qr.created_at,
          ROW_NUMBER() OVER (PARTITION BY qr.question_id ORDER BY qr.created_at DESC) as rn
        FROM question_responses qr
        WHERE qr.session_id = ?
      )
      SELECT 
        q.question_content,
        q.difficulty,
        rr.selected_answer,
        rr.is_correct,
        rr.is_skipped,
        rr.time_spent
      FROM RankedResponses rr
      JOIN questions q ON rr.question_id = q.question_id
      WHERE rr.rn = 1
      ORDER BY rr.created_at
      `,
      [sessionId]
    );

    console.log('Found distinct questions:', questionDetails.length);

    // Calculate overall statistics
    const stats = {
      questions: questionDetails.length,
      answered: questionDetails.filter((q) => !q.is_skipped).length,
      skipped: questionDetails.filter((q) => q.is_skipped).length,
      correct: questionDetails.filter((q) => q.is_correct).length,
      wrong: questionDetails.filter((q) => !q.is_correct && !q.is_skipped)
        .length,
      totalTime: questionDetails.reduce(
        (sum, q) => sum + (q.time_spent || 0),
        0
      ),

      // Format question details for the results table
      questionDetails: questionDetails.map((q, index) => ({
        snippet:
          q.question_content?.substring(0, 50) +
            (q.question_content?.length > 50 ? '...' : '') ||
          `Question ${index + 1}`,
        status: q.is_skipped ? 'skipped' : q.is_correct ? 'correct' : 'wrong',
        difficulty: q.difficulty || 'Medium',
        time: q.time_spent || 0,
      })),
    };

    // Calculate derived statistics
    const answered = stats.answered;
    stats.accuracy =
      answered > 0 ? Math.round((stats.correct / answered) * 100) : 0;
    stats.score = stats.correct * 1 - stats.wrong;
    stats.avgTimePerQuestion =
      answered > 0 ? Math.round(stats.totalTime / answered) : 0;
    stats.avgTimePerCorrectAnswer =
      stats.correct > 0 ? Math.round(stats.totalTime / stats.correct) : 0;

    // Update session status
    await pool.execute(
      `
      UPDATE test_sessions
      SET 
        status = 'completed',
        end_time = CURRENT_TIMESTAMP,
        score = ?,
        total_time_spent = ?
      WHERE id = ? AND user_id = ?
      `,
      [stats.score, stats.totalTime, sessionId, userId]
    );

    console.log('Test completed with stats:', {
      totalQuestions: stats.questions,
      answered: stats.answered,
      skipped: stats.skipped,
      correct: stats.correct,
      wrong: stats.wrong,
    });

    return Response.json({ success: true, stats });
  } catch (error) {
    console.error('Session completion failed:', error);
    return Response.json(
      { error: 'Failed to complete session', details: error.message },
      { status: 500 }
    );
  }
}
