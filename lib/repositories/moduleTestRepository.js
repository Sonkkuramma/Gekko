// lib/repositories/moduleTestRepository.js
import { getConnection } from '@/lib/db';

/**
 * Fetches module tests for a given test pack with validation and proper error handling
 * @param {string} testPackId - The ID of the test pack
 * @returns {Promise<Object>} Nested structure of sections, modules, and tests
 */
export async function getModuleTests(testPackId) {
  const logPrefix = `[ModuleTests:${testPackId}]`;
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
        mt.module_test_id,
        mt.name as test_name,
        mt.difficulty,
        mt.num_questions,
        mt.module_id,
        m.name as module_name,
        mt.section_id,
        s.name as section_name
      FROM pack_tests pt
      JOIN module_tests mt ON pt.test_id = mt.module_test_id
        AND mt.exam_id = ?
      JOIN moduleid m ON mt.module_id = m.module_id 
        AND m.exam_id = mt.exam_id 
        AND m.section_id = mt.section_id
      JOIN sectionid s ON mt.section_id = s.section_id 
        AND s.exam_id = mt.exam_id
      WHERE pt.pack_id = ?
      ORDER BY s.name, m.name, mt.name
    `;

    console.log(
      `${logPrefix} Executing query with packId: ${testPackId}, examId: ${examId}`
    );

    const [results] = await pool.query(query, [examId, testPackId]);
    console.log(`${logPrefix} Found ${results.length} module tests`);

    if (!results?.length) {
      console.log(`${logPrefix} No tests found`);
      return { sections: [] };
    }

    // Transform the flat data into nested structure
    const sectionMap = new Map();

    results.forEach((row) => {
      // Get or create section
      if (!sectionMap.has(row.section_id)) {
        sectionMap.set(row.section_id, {
          section_id: row.section_id,
          name: row.section_name,
          modules: new Map(),
        });
      }
      const section = sectionMap.get(row.section_id);

      // Get or create module
      if (!section.modules.has(row.module_id)) {
        section.modules.set(row.module_id, {
          module_id: row.module_id,
          name: row.module_name,
          tests: [],
        });
      }
      const module = section.modules.get(row.module_id);

      // Add test
      module.tests.push({
        module_test_id: row.module_test_id,
        name: row.test_name,
        difficulty: row.difficulty,
        num_questions: row.num_questions,
      });
    });

    // Transform maps to arrays for response
    const response = {
      sections: Array.from(sectionMap.values()).map((section) => ({
        ...section,
        modules: Array.from(section.modules.values()),
      })),
    };

    console.log(
      `${logPrefix} Successfully transformed data with ${response.sections.length} sections`
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
    throw new Error(`Failed to fetch module tests: ${error.message}`);
  }
}
