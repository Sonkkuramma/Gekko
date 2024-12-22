// app/test/[slug]/page.jsx
import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getConnection } from '@/lib/db';
import TestInterface from '../_components/TestInterface';
import { auth } from '@clerk/nextjs/server';

// Loading and Error components remain the same
function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading test...</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorState({ error, reset }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || 'Test Not Available'}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
            <Button onClick={() => reset()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function getTestData(slug) {
  const pool = await getConnection();
  let testData = null;

  try {
    // First, determine test type and get basic info with corrected query order
    const [testTypeResults] = await pool.query(
      `
      SELECT 
        CASE 
          WHEN mt.module_test_id IS NOT NULL THEN 'module'
          WHEN tt.topic_test_id IS NOT NULL THEN 'topic'
          WHEN st.section_test_id IS NOT NULL THEN 'section'
        END as test_type,
        CASE
          WHEN mt.module_test_id IS NOT NULL THEN mt.module_test_id
          WHEN tt.topic_test_id IS NOT NULL THEN tt.topic_test_id
          WHEN st.section_test_id IS NOT NULL THEN st.section_test_id
        END as test_id,
        CASE
          WHEN mt.module_test_id IS NOT NULL THEN mt.name
          WHEN tt.topic_test_id IS NOT NULL THEN tt.name
          WHEN st.section_test_id IS NOT NULL THEN st.name
        END as test_name,
        CASE
          WHEN mt.module_test_id IS NOT NULL THEN mt.duration_minutes
          WHEN tt.topic_test_id IS NOT NULL THEN tt.duration_minutes
          WHEN st.section_test_id IS NOT NULL THEN 45
        END as duration_minutes,
        CASE
          WHEN mt.module_test_id IS NOT NULL THEN mt.difficulty
          WHEN tt.topic_test_id IS NOT NULL THEN tt.difficulty
          WHEN st.section_test_id IS NOT NULL THEN st.difficulty
        END as difficulty,
        CASE
          WHEN mt.module_test_id IS NOT NULL THEN mt.num_questions
          WHEN tt.topic_test_id IS NOT NULL THEN tt.num_questions
          WHEN st.section_test_id IS NOT NULL THEN st.num_modules
        END as question_count
      FROM module_tests mt
      LEFT JOIN topic_tests tt ON tt.slug = ?
      LEFT JOIN section_tests st ON st.slug = ?
      WHERE mt.slug = ? OR tt.slug = ? OR st.slug = ?
      LIMIT 1
    `,
      [slug, slug, slug, slug, slug]
    );

    if (!testTypeResults.length) {
      throw new Error('Test not found');
    }

    const testInfo = testTypeResults[0];
    console.log('Found test info:', testInfo); // Add logging

    // Get questions based on test type
    let questions = [];
    let topicName = '';

    switch (testInfo.test_type) {
      case 'module':
        const [moduleData] = await pool.query(
          `
          SELECT 
            q.question_id,
            q.question_content,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_answer,
            m.name as module_name,
            s.name as section_name
          FROM questions q
          JOIN module_test_questions mtq ON q.question_id = mtq.question_id
          JOIN module_tests mt ON mtq.module_test_id = mt.module_test_id
          JOIN moduleid m ON mt.module_id = m.module_id
          JOIN sectionid s ON m.section_id = s.section_id
          WHERE mt.module_test_id = ?
          ORDER BY mtq.module_test_id
        `,
          [testInfo.test_id]
        );

        questions = moduleData.map((q) => ({
          id: q.question_id,
          question: q.question_content,
          options: [q.option_a, q.option_b, q.option_c, q.option_d],
          correctAnswer: q.correct_answer,
        }));

        topicName =
          moduleData.length > 0
            ? `${moduleData[0].section_name} - ${moduleData[0].module_name}`
            : 'Unknown Module';
        break;

      case 'section':
        const [sectionQuestions] = await pool.query(
          `
          SELECT DISTINCT
            q.question_id,
            q.question_content,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_answer,
            s.name as section_name
          FROM questions q
          JOIN module_test_questions mtq ON q.question_id = mtq.question_id
          JOIN module_tests mt ON mtq.module_test_id = mt.module_test_id
          JOIN section_test_module_test stmt ON mt.module_test_id = stmt.module_test_id
          JOIN section_tests st ON stmt.section_test_id = st.section_test_id
          JOIN sectionid s ON st.section_id = s.section_id
          WHERE st.section_test_id = ?
          ORDER BY mtq.module_test_id
        `,
          [testInfo.test_id]
        );

        questions = sectionQuestions.map((q) => ({
          id: q.question_id,
          question: q.question_content,
          options: [q.option_a, q.option_b, q.option_c, q.option_d],
          correctAnswer: q.correct_answer,
        }));

        topicName =
          sectionQuestions.length > 0
            ? sectionQuestions[0].section_name
            : 'Unknown Section';
        break;

      case 'topic':
        const [topicData] = await pool.query(
          `
          SELECT 
            q.question_id,
            q.question_content,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_answer,
            t.name as topic_name,
            m.name as module_name
          FROM questions q
          JOIN topic_test_questions ttq ON q.question_id = ttq.question_id
          JOIN topic_tests tt ON ttq.topic_test_id = tt.topic_test_id
          JOIN topicid t ON tt.topic_id = t.topic_id
          JOIN moduleid m ON t.module_id = m.module_id
          WHERE tt.topic_test_id = ?
          ORDER BY ttq.question_id
        `,
          [testInfo.test_id]
        );

        questions = topicData.map((q) => ({
          id: q.question_id,
          question: q.question_content,
          options: [q.option_a, q.option_b, q.option_c, q.option_d],
          correctAnswer: q.correct_answer,
        }));

        topicName =
          topicData.length > 0
            ? `${topicData[0].module_name} - ${topicData[0].topic_name}`
            : 'Unknown Topic';
        break;

      default:
        throw new Error(`Invalid test type: ${testInfo.test_type}`);
    }

    // Construct final test data
    testData = {
      testId: testInfo.test_id,
      testType: testInfo.test_type,
      testName: testInfo.test_name,
      topicName,
      questionCount: questions.length,
      timePerQuestion: Math.floor(
        (testInfo.duration_minutes * 60) / Math.max(questions.length, 1)
      ),
      difficulty: testInfo.difficulty,
      questions,
      slug, // Add slug to testData
    };

    console.log('Constructed test data:', {
      testId: testData.testId,
      testType: testData.testType,
      testName: testData.testName,
      questionCount: testData.questionCount,
    });

    return testData;
  } catch (error) {
    console.error('Error fetching test data:', error);
    throw new Error(`Failed to load test: ${error.message}`);
  }
}

export default async function TestPage({ params }) {
  const { userId } = auth();
  const { slug } = params; // Get the slug from params

  if (!userId) {
    return (
      <ErrorState
        error={{ message: 'Please log in to take this test' }}
        reset={() => (window.location.href = '/sign-in')}
      />
    );
  }

  try {
    const testData = await getTestData(slug);

    if (!testData) {
      return <ErrorState error={{ message: 'Test not found' }} />;
    }

    // Check if user is enrolled for this test
    const pool = await getConnection();
    const [enrollment] = await pool.query(
      `
      SELECT ue.* 
      FROM user_enrollments ue
      JOIN pack_tests pt ON ue.test_pack_id = pt.pack_id
      WHERE ue.user_id = ? 
      AND pt.test_id = ?
      AND ue.status = 'active'
      LIMIT 1
    `,
      [userId, testData.testId]
    );

    if (!enrollment.length) {
      return (
        <ErrorState
          error={{ message: 'You are not enrolled in this test' }}
          reset={() => (window.location.href = '/test-packs')}
        />
      );
    }

    // Check for existing test progress
    const [progress] = await pool.query(
      `
      SELECT * FROM user_test_progress
      WHERE user_id = ? 
      AND test_id = ?
      AND status IN ('not_started', 'in_progress')
      ORDER BY created_at DESC 
      LIMIT 1
    `,
      [userId, testData.testId]
    );

    const testDataWithProgress = {
      ...testData,
      progress: progress[0] || null,
    };

    return (
      <Suspense fallback={<LoadingState />}>
        <TestInterface
          testData={{
            ...testData,
            slug, // Add slug to testData
          }}
          testId={testData.testId}
          userId={userId}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Test page error:', error);
    return <ErrorState error={error} reset={() => window.location.reload()} />;
  }
}
