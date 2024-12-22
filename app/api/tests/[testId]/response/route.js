// app/api/tests/[testId]/response/route.js
import { getAuth } from '@clerk/nextjs/server';
import { getConnection } from '@/lib/db';

export async function POST(request, { params }) {
  const startTime = Date.now();
  console.log(`[${startTime}] Response API called for test: ${params.testId}`);

  try {
    const { userId } = getAuth(request);
    const body = await request.json();

    console.log('Request payload:', {
      userId,
      testId: params.testId,
      ...body,
    });

    const {
      sessionId,
      questionId,
      selectedAnswer,
      isCorrect,
      timeSpent,
      isSkipped,
    } = body;

    // Validation
    if (!userId) {
      console.error('Unauthorized request - no userId');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!sessionId || !questionId) {
      console.error('Missing required fields:', { sessionId, questionId });
      return Response.json(
        {
          error: 'Missing required fields',
          details: { sessionId, questionId },
        },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    // Verify session belongs to user
    console.log('Verifying session:', { sessionId, userId });
    const [sessions] = await pool.query(
      'SELECT id FROM test_sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    );

    if (!sessions.length) {
      console.error('Invalid session:', { sessionId, userId });
      return Response.json({ error: 'Invalid session' }, { status: 403 });
    }

    // Verify question exists
    console.log('Verifying question:', { questionId });
    const [questions] = await pool.query(
      'SELECT question_id FROM questions WHERE question_id = ?',
      [questionId]
    );

    if (!questions.length) {
      console.error('Invalid question:', { questionId });
      return Response.json({ error: 'Invalid question' }, { status: 400 });
    }

    // Process the answer/skip
    let processedAnswer = null;
    if (!isSkipped && selectedAnswer) {
      // Ensure answer is a single character (A, B, C, D)
      processedAnswer = selectedAnswer.charAt(0).toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(processedAnswer)) {
        console.error('Invalid answer format:', { selectedAnswer });
        return Response.json(
          { error: 'Invalid answer format' },
          { status: 400 }
        );
      }
    }

    // Check for existing response
    console.log('Checking for existing response');
    const [existing] = await pool.query(
      'SELECT id FROM question_responses WHERE session_id = ? AND question_id = ?',
      [sessionId, questionId]
    );

    if (existing.length) {
      console.log('Updating existing response');
      await pool.execute(
        `
        UPDATE question_responses 
        SET 
          selected_answer = ?,
          is_correct = ?,
          time_spent = ?,
          is_skipped = ?
        WHERE session_id = ? AND question_id = ?
      `,
        [
          processedAnswer,
          isSkipped ? 0 : isCorrect ? 1 : 0,
          timeSpent || 0,
          isSkipped ? 1 : 0,
          sessionId,
          questionId,
        ]
      );
    } else {
      console.log('Inserting new response');
      await pool.execute(
        `
        INSERT INTO question_responses (
          session_id,
          question_id,
          selected_answer,
          is_correct,
          time_spent,
          is_skipped
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          sessionId,
          questionId,
          processedAnswer,
          isSkipped ? 0 : isCorrect ? 1 : 0,
          timeSpent || 0,
          isSkipped ? 1 : 0,
        ]
      );
    }

    const endTime = Date.now();
    console.log(
      `[${endTime}] Response processed successfully in ${endTime - startTime}ms`
    );

    return Response.json({
      success: true,
      message: isSkipped
        ? 'Question skipped successfully'
        : 'Response saved successfully',
    });
  } catch (error) {
    const endTime = Date.now();
    console.error(
      `[${endTime}] Response processing failed after ${endTime - startTime}ms:`,
      {
        error: error.message,
        code: error.code,
        stack: error.stack,
      }
    );

    return Response.json(
      {
        error: 'Failed to save response',
        details: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
