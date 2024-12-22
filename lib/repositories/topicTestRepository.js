// lib/repositories/topicTestRepository.js
import { getConnection } from '@/lib/db';

/**
 * Fetches topic tests for a given test pack with validation and proper error handling
 * @param {string} testPackId - The ID of the test pack
 * @returns {Promise<Object>} Nested structure of modules, topics, and tests
 */
export async function getTopicTests(testPackId) {
  const logPrefix = `[TopicTests:${testPackId}]`;
  console.log(`${logPrefix} Starting fetch`);

  try {
    const pool = await getConnection();

    // Validate test pack and get exam_id
    const [testPack] = await pool.query(
      'SELECT exam_id FROM test_packs WHERE pack_id = ?',
      [testPackId]
    );

    if (!testPack?.[0]?.exam_id) {
      throw new Error(`Test pack not found: ${testPackId}`);
    }

    const examId = testPack[0].exam_id;
    console.log(`${logPrefix} Found exam_id: ${examId}`);

    // Main query with exam validation
    const query = `
      SELECT DISTINCT 
        tt.topic_test_id,
        tt.name as test_name,
        tt.difficulty,
        tt.num_questions,
        tt.module_id,
        m.name as module_name,
        tt.topic_id,
        t.name as topic_name
      FROM pack_tests pt
      JOIN topic_tests tt ON pt.test_id = tt.topic_test_id
        AND tt.exam_id = ?
      JOIN moduleid m ON tt.module_id = m.module_id 
        AND m.exam_id = tt.exam_id
      JOIN topicid t ON tt.topic_id = t.topic_id
        AND t.exam_id = tt.exam_id
      WHERE pt.pack_id = ?
      ORDER BY m.name, t.name, tt.name
    `;

    console.log(
      `${logPrefix} Executing query with packId: ${testPackId}, examId: ${examId}`
    );

    const [results] = await pool.query(query, [examId, testPackId]);
    console.log(`${logPrefix} Found ${results.length} topic tests`);

    if (!results?.length) {
      console.log(`${logPrefix} No tests found`);
      return { modules: [] };
    }

    // Transform the flat data into nested structure
    const moduleMap = new Map();

    results.forEach((row) => {
      // Get or create module
      if (!moduleMap.has(row.module_id)) {
        moduleMap.set(row.module_id, {
          module_id: row.module_id,
          name: row.module_name,
          topics: new Map(),
        });
      }
      const module = moduleMap.get(row.module_id);

      // Get or create topic
      if (!module.topics.has(row.topic_id)) {
        module.topics.set(row.topic_id, {
          topic_id: row.topic_id,
          name: row.topic_name,
          tests: [],
        });
      }
      const topic = module.topics.get(row.topic_id);

      // Add test
      topic.tests.push({
        topic_test_id: row.topic_test_id,
        name: row.test_name,
        difficulty: row.difficulty,
        num_questions: row.num_questions,
      });
    });

    // Transform maps to arrays for response
    const response = {
      modules: Array.from(moduleMap.values()).map((module) => ({
        ...module,
        topics: Array.from(module.topics.values()),
      })),
    };

    console.log(
      `${logPrefix} Successfully transformed data with ${response.modules.length} modules`
    );
    return response;
  } catch (error) {
    console.error(`${logPrefix} Error:`, {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      stack: error.stack,
    });
    throw new Error(`Failed to fetch topic tests: ${error.message}`);
  }
}
