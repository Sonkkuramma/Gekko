// app/api/tests/[testId]/check-session/route.js
import { auth } from '@clerk/nextjs/server';
import { getConnection } from '@/lib/db';

export async function GET(req, { params }) {
  try {
    console.log('Check-session request:', {
      url: req.url,
      params,
      testId: params.testId,
    });

    // Auth check
    const session = auth();
    const userId = session?.userId;

    if (!userId) {
      console.log('No authenticated user found');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('Authenticated user:', userId);

    const { testId } = params;
    const pool = await getConnection();

    // First try to find the actual test ID using a corrected query
    const [testInfo] = await pool.query(
      `SELECT 
        CASE
          WHEN mt.module_test_id IS NOT NULL THEN mt.module_test_id
          WHEN tt.topic_test_id IS NOT NULL THEN tt.topic_test_id
          WHEN st.section_test_id IS NOT NULL THEN st.section_test_id
        END as test_id,
        CASE
          WHEN mt.module_test_id IS NOT NULL THEN 'module'
          WHEN tt.topic_test_id IS NOT NULL THEN 'topic'
          WHEN st.section_test_id IS NOT NULL THEN 'section'
        END as test_type,
        CASE
          WHEN mt.module_test_id IS NOT NULL THEN mt.name
          WHEN tt.topic_test_id IS NOT NULL THEN tt.name
          WHEN st.section_test_id IS NOT NULL THEN st.name
        END as test_name,
        CASE
          WHEN mt.module_test_id IS NOT NULL THEN mt.slug
          WHEN tt.topic_test_id IS NOT NULL THEN tt.slug
          WHEN st.section_test_id IS NOT NULL THEN st.slug
        END as test_slug
      FROM module_tests mt
      LEFT JOIN topic_tests tt ON tt.slug = ?
      LEFT JOIN section_tests st ON st.slug = ?
      WHERE mt.slug = ? OR tt.slug = ? OR st.slug = ?
      LIMIT 1`,
      [testId, testId, testId, testId, testId]
    );

    console.log('Test lookup results:', testInfo);

    if (!testInfo?.length || !testInfo[0]?.test_id) {
      console.error('Test not found:', testId);
      return Response.json(
        {
          error: 'Test not found',
          requestedId: testId,
        },
        { status: 404 }
      );
    }

    const actualTestId = testInfo[0].test_id;
    const testType = testInfo[0].test_type;
    const testSlug = testInfo[0].test_slug;

    console.log('Resolved test:', { actualTestId, testType, testSlug });

    // Verify enrollment
    const [enrollment] = await pool.query(
      `SELECT ue.* 
       FROM user_enrollments ue
       JOIN pack_tests pt ON ue.test_pack_id = pt.pack_id
       WHERE ue.user_id = ? 
         AND pt.test_id = ?
         AND ue.status = 'active'
       LIMIT 1`,
      [userId, actualTestId]
    );

    if (!enrollment.length) {
      console.log('No enrollment found:', { userId, testId: actualTestId });
      return Response.json(
        {
          error: 'Not enrolled',
          testId: actualTestId,
          testType,
          testSlug,
        },
        { status: 403 }
      );
    }

    // Check for existing session
    const [sessions] = await pool.query(
      `SELECT 
        s.id as sessionId,
        s.current_question_index as currentQuestion,
        s.status,
        s.test_type,
        s.start_time,
        s.last_activity_time,
        s.total_time_spent
       FROM test_sessions s
       WHERE s.test_id = ? 
         AND s.user_id = ?
         AND s.status = 'in_progress'
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [actualTestId, userId]
    );

    if (!sessions.length) {
      return Response.json({
        existingSession: false,
        testId: actualTestId,
        testType,
        testName: testInfo[0].test_name,
        testSlug,
      });
    }

    const sessionData = sessions[0];

    // Get responses for existing session
    const [responses] = await pool.query(
      `SELECT 
        qr.question_id as questionId,
        qr.selected_answer as selectedAnswer,
        qr.is_correct as isCorrect,
        qr.time_spent as timeSpent,
        qr.is_skipped as isSkipped
       FROM question_responses qr
       WHERE qr.session_id = ?
       ORDER BY qr.created_at ASC`,
      [sessionData.sessionId]
    );

    const formattedResponses = responses.map((response) => ({
      questionId: response.questionId,
      status: response.isSkipped
        ? 'skipped'
        : !response.selectedAnswer
        ? 'unanswered'
        : response.isCorrect
        ? 'correct'
        : 'wrong',
      selectedAnswer: response.selectedAnswer,
      timeSpent: response.timeSpent,
    }));

    return Response.json({
      existingSession: true,
      sessionId: sessionData.sessionId,
      currentQuestion: sessionData.currentQuestion,
      status: sessionData.status,
      testType,
      testId: actualTestId,
      testName: testInfo[0].test_name,
      testSlug,
      startTime: sessionData.start_time,
      lastActivityTime: sessionData.last_activity_time,
      totalTimeSpent: sessionData.total_time_spent,
      answers: formattedResponses,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return Response.json(
      {
        error: 'Failed to check session',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
