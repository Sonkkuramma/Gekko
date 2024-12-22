// app/api/user/dashboard/route.js
import { db } from '@/lib/db';

export async function GET(req) {
  try {
    // Get user ID from session (using Clerk)
    const { userId } = auth();

    // Get current test
    const currentTest = await db.query(
      `
      SELECT t.*, ts.status, ts.answered_questions, ts.time_remaining
      FROM test_sessions ts
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.user_id = ? AND ts.status = 'in_progress'
      ORDER BY ts.created_at DESC
      LIMIT 1
    `,
      [userId]
    );

    // Get recent tests
    const recentTests = await db.query(
      `
      SELECT t.*, ts.score, ts.completed_at
      FROM test_sessions ts
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.user_id = ? AND ts.status = 'completed'
      ORDER BY ts.completed_at DESC
      LIMIT 5
    `,
      [userId]
    );

    return Response.json({ currentTest, recentTests });
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return Response.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
