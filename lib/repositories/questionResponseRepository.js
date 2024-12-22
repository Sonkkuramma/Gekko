export const questionResponseRepository = {
  /**
   * Save a question response
   */
  async saveResponse({
    sessionId,
    questionId,
    selectedAnswer,
    isCorrect,
    timeSpent,
    isSkipped = false,
  }) {
    const query = `
        INSERT INTO question_responses (
          session_id,
          question_id,
          selected_answer,
          is_correct,
          time_spent,
          is_skipped
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `;

    await db.execute(query, [
      sessionId,
      questionId,
      selectedAnswer,
      isCorrect,
      timeSpent,
      isSkipped,
    ]);
  },

  /**
   * Get all responses for a session
   */
  async getSessionResponses(sessionId) {
    const query = `
        SELECT * FROM question_responses
        WHERE session_id = ?
        ORDER BY created_at ASC
      `;

    const [rows] = await db.execute(query, [sessionId]);
    return rows;
  },

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId) {
    const query = `
        SELECT 
          COUNT(*) as total_questions,
          SUM(is_correct) as correct_answers,
          SUM(is_skipped) as skipped_questions,
          SUM(time_spent) as total_time_spent,
          AVG(CASE WHEN is_correct = 1 THEN time_spent END) as avg_time_correct,
          AVG(CASE WHEN is_correct = 0 THEN time_spent END) as avg_time_incorrect
        FROM question_responses
        WHERE session_id = ?
      `;

    const [rows] = await db.execute(query, [sessionId]);
    return rows[0];
  },
};
