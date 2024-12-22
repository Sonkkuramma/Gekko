import { db } from '@/lib/db';

export const testSessionRepository = {
  /**
   * Create a new test session
   * @param {Object} params
   * @param {string} params.userId
   * @param {string} params.testId
   * @param {string} params.testType - 'topic', 'module', or 'section'
   */
  async create({ userId, testId, testType }) {
    const query = `
      INSERT INTO test_sessions (
        user_id, 
        test_id,
        test_type,
        start_time,
        last_activity_time,
        status,
        current_question_index
      )
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'in_progress', 0)
    `;

    const [result] = await db.execute(query, [userId, testId, testType]);
    return { id: result.insertId };
  },

  /**
   * Get active session for user and test
   */
  async getCurrentSession({ userId, testId }) {
    const query = `
      SELECT * FROM test_sessions 
      WHERE user_id = ? 
      AND test_id = ? 
      AND status IN ('in_progress', 'paused')
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    const [rows] = await db.execute(query, [userId, testId]);
    return rows[0] || null;
  },

  /**
   * Update session progress
   */
  async updateProgress({
    sessionId,
    currentQuestionIndex,
    status = 'in_progress',
  }) {
    const query = `
      UPDATE test_sessions 
      SET 
        current_question_index = ?,
        status = ?,
        last_activity_time = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.execute(query, [currentQuestionIndex, status, sessionId]);
  },

  /**
   * Complete a test session
   */
  async complete({ sessionId, score, totalTimeSpent }) {
    const query = `
      UPDATE test_sessions 
      SET 
        status = 'completed',
        end_time = CURRENT_TIMESTAMP,
        score = ?,
        total_time_spent = ?
      WHERE id = ?
    `;

    await db.execute(query, [score, totalTimeSpent, sessionId]);
  },

  /**
   * Pause a test session
   */
  async pause({ sessionId }) {
    const query = `
      UPDATE test_sessions 
      SET 
        status = 'paused',
        last_activity_time = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.execute(query, [sessionId]);
  },

  /**
   * Abandon a test session
   */
  async abandon({ sessionId }) {
    const query = `
      UPDATE test_sessions 
      SET 
        status = 'abandoned',
        end_time = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.execute(query, [sessionId]);
  },
};
