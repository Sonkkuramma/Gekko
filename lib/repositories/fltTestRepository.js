// lib/repositories/fltTestRepository.js
import { getConnection } from '@/lib/db';

/**
 * Fetches full length tests for a given test pack with validation and proper error handling
 * @param {string} testPackId - The ID of the test pack
 * @returns {Promise<Object>} Structure of full length tests with their sections
 */
export async function getFullLengthTests(testPackId) {
  const logPrefix = `[FullLengthTests:${testPackId}]`;
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
        flt.fulllength_test_id,
        flt.name as test_name,
        flt.description,
        flt.total_time,
        flt.total_marks,
        fts.section_id,
        s.name as section_name,
        fts.section_time_limit,
        fts.section_marks
      FROM pack_tests pt
      JOIN fulllength_tests flt ON pt.test_id = flt.fulllength_test_id
        AND flt.exam_id = ?
      JOIN fulllength_test_sections fts ON flt.fulllength_test_id = fts.fulllength_test_id
      JOIN sectionid s ON fts.section_id = s.section_id 
        AND s.exam_id = flt.exam_id
      WHERE pt.pack_id = ?
      ORDER BY flt.name, s.name
    `;

    console.log(
      `${logPrefix} Executing query with packId: ${testPackId}, examId: ${examId}`
    );

    const [results] = await pool.query(query, [examId, testPackId]);
    console.log(
      `${logPrefix} Found ${results.length} full length test sections`
    );

    if (!results?.length) {
      console.log(`${logPrefix} No tests found`);
      return { tests: [] };
    }

    // Transform the flat data into nested structure
    const testMap = new Map();

    results.forEach((row) => {
      // Get or create full length test
      if (!testMap.has(row.fulllength_test_id)) {
        testMap.set(row.fulllength_test_id, {
          fulllength_test_id: row.fulllength_test_id,
          name: row.test_name,
          description: row.description,
          total_time: row.total_time,
          total_marks: row.total_marks,
          sections: [],
        });
      }
      const test = testMap.get(row.fulllength_test_id);

      // Add section
      test.sections.push({
        section_id: row.section_id,
        name: row.section_name,
        time_limit: row.section_time_limit,
        marks: row.section_marks,
      });
    });

    // Transform map to array for response
    const response = {
      tests: Array.from(testMap.values()),
    };

    console.log(
      `${logPrefix} Successfully transformed data with ${response.tests.length} full length tests`
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
    throw new Error(`Failed to fetch full length tests: ${error.message}`);
  }
}

/**
 * Fetches detailed information for a specific full length test
 * @param {string} testId - The ID of the full length test
 * @returns {Promise<Object>} Detailed test information with sections and their questions
 */
export async function getFullLengthTestDetails(testId) {
  const logPrefix = `[FullLengthTestDetails:${testId}]`;
  console.log(`${logPrefix} Starting fetch`);

  try {
    const pool = await getConnection();

    // First query: Get test basic information
    const [testInfo] = await pool.query(
      `SELECT 
        fulllength_test_id,
        name,
        description,
        total_time,
        total_marks,
        exam_id
      FROM fulllength_tests 
      WHERE fulllength_test_id = ?`,
      [testId]
    );

    if (!testInfo?.[0]) {
      throw new Error(`Full length test not found: ${testId}`);
    }

    // Second query: Get sections with their questions
    const query = `
      SELECT 
        fts.section_id,
        s.name as section_name,
        fts.section_time_limit,
        fts.section_marks,
        q.question_id,
        q.question_text,
        q.question_type,
        q.marks
      FROM fulllength_test_sections fts
      JOIN sectionid s ON fts.section_id = s.section_id
      LEFT JOIN fulllength_test_questions ftq ON fts.fulllength_test_id = ftq.fulllength_test_id 
        AND fts.section_id = ftq.section_id
      LEFT JOIN questions q ON ftq.question_id = q.question_id
      WHERE fts.fulllength_test_id = ?
      ORDER BY s.name, q.question_id
    `;

    const [results] = await pool.query(query, [testId]);

    // Transform the data
    const sectionMap = new Map();

    results.forEach((row) => {
      // Get or create section
      if (!sectionMap.has(row.section_id)) {
        sectionMap.set(row.section_id, {
          section_id: row.section_id,
          name: row.section_name,
          time_limit: row.section_time_limit,
          marks: row.section_marks,
          questions: [],
        });
      }
      const section = sectionMap.get(row.section_id);

      // Add question if it exists
      if (row.question_id) {
        section.questions.push({
          question_id: row.question_id,
          text: row.question_text,
          type: row.question_type,
          marks: row.marks,
        });
      }
    });

    // Prepare final response
    const response = {
      fulllength_test_id: testInfo[0].fulllength_test_id,
      name: testInfo[0].name,
      description: testInfo[0].description,
      total_time: testInfo[0].total_time,
      total_marks: testInfo[0].total_marks,
      exam_id: testInfo[0].exam_id,
      sections: Array.from(sectionMap.values()),
    };

    console.log(
      `${logPrefix} Successfully fetched test details with ${response.sections.length} sections`
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
    throw new Error(
      `Failed to fetch full length test details: ${error.message}`
    );
  }
}
