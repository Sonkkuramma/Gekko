// lib/repositories/sectionTestRepository.js
import { getConnection } from '@/lib/db';

/**
 * Get all section tests for a test pack
 */
export async function getSectionTests(testPackId) {
  const logPrefix = `[SectionTests:${testPackId}]`;
  console.log(`${logPrefix} Starting fetch`);

  try {
    const pool = await getConnection();

    // Get exam_id first
    const [testPack] = await pool.query(
      'SELECT exam_id FROM test_packs WHERE pack_id = ?',
      [testPackId]
    );

    if (!testPack?.[0]?.exam_id) {
      throw new Error(`Test pack not found: ${testPackId}`);
    }

    const examId = testPack[0].exam_id;
    console.log(`${logPrefix} Found exam_id: ${examId}`);

    const query = `
      SELECT 
        st.section_test_id as id,
        st.name,
        st.difficulty,
        st.exam_id,
        st.section_id,
        GROUP_CONCAT(DISTINCT mt.module_test_id) as module_test_ids,
        COUNT(DISTINCT mtq.question_id) as num_questions
      FROM section_tests st
      LEFT JOIN section_test_module_test stmt ON st.section_test_id = stmt.section_test_id
      LEFT JOIN module_tests mt ON stmt.module_test_id = mt.module_test_id
      LEFT JOIN module_test_questions mtq ON mt.module_test_id = mtq.module_test_id
      WHERE st.exam_id = ?
      GROUP BY st.section_test_id, st.name, st.difficulty, st.exam_id, st.section_id
    `;

    const [results] = await pool.query(query, [examId]);

    return results.map((row) => ({
      id: row.id,
      name: row.name,
      difficulty: row.difficulty,
      exam_id: row.exam_id,
      section_id: row.section_id,
      module_test_ids: row.module_test_ids
        ? row.module_test_ids.split(',')
        : [],
      num_questions: Number(row.num_questions) || 0,
    }));
  } catch (error) {
    console.error(`${logPrefix} Error:`, error);
    throw new Error(`Failed to fetch section tests: ${error.message}`);
  }
}

/**
 * Get complete section test data including modules and questions
 */
export async function getSectionTestData(sectionTestId) {
  const logPrefix = `[SectionTestData:${sectionTestId}]`;
  console.log(`${logPrefix} Starting fetch`);

  try {
    const pool = await getConnection();

    // 1. Get section test details
    const [sectionTests] = await pool.query(
      'SELECT * FROM section_tests WHERE section_test_id = ?',
      [sectionTestId]
    );

    if (!sectionTests.length) {
      console.log(`${logPrefix} Section test not found`);
      return null;
    }

    const sectionTest = sectionTests[0];
    console.log(`${logPrefix} Found section test:`, sectionTest.name);

    // 2. Get associated module tests
    const moduleQuery = `
      SELECT mt.*
      FROM module_tests mt
      JOIN section_test_module_test stmt ON mt.module_test_id = stmt.module_test_id
      WHERE stmt.section_test_id = ?
    `;

    const [moduleTests] = await pool.query(moduleQuery, [sectionTestId]);
    console.log(`${logPrefix} Found ${moduleTests.length} module tests`);

    // 3. Get questions for each module test
    const moduleTestsWithQuestions = await Promise.all(
      moduleTests.map(async (moduleTest) => {
        const questionQuery = `
          SELECT 
            q.question_id,
            q.question_content,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_answer,
            q.explanation
          FROM module_test_questions mtq 
          JOIN questions q ON mtq.question_id = q.question_id
          WHERE mtq.module_test_id = ?
          ORDER BY mtq.question_id
        `;

        const [questions] = await pool.query(questionQuery, [
          moduleTest.module_test_id,
        ]);
        console.log(
          `${logPrefix} Found ${questions.length} questions for module ${moduleTest.module_test_id}`
        );

        return {
          ...moduleTest,
          questions,
        };
      })
    );

    // 4. Get section information
    const [sectionInfo] = await pool.query(
      'SELECT * FROM sectionid WHERE section_id = ?',
      [sectionTest.section_id]
    );

    return {
      id: sectionTest.section_test_id,
      name: sectionTest.name,
      difficulty: sectionTest.difficulty,
      exam_id: sectionTest.exam_id,
      section_id: sectionTest.section_id,
      section_name: sectionInfo[0]?.name || 'Unknown Section',
      created_at: sectionTest.created_at,
      modules: moduleTestsWithQuestions,
      total_questions: moduleTestsWithQuestions.reduce(
        (sum, module) => sum + module.questions.length,
        0
      ),
    };
  } catch (error) {
    console.error(`${logPrefix} Error:`, error);
    throw error;
  }
}

/**
 * Get section test by slug
 */
export async function getSectionTestBySlug(slug) {
  try {
    const pool = await getConnection();
    const [tests] = await pool.query(
      'SELECT * FROM section_tests WHERE slug = ?',
      [slug]
    );
    return tests[0] || null;
  } catch (error) {
    console.error('Error in getSectionTestBySlug:', error);
    throw error;
  }
}
