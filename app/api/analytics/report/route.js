import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const { sessionClaims } = auth();
    const { searchParams } = new URL(req.url);

    // Validate admin access
    if (sessionClaims?.metadata?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get query parameters with defaults
    const startDate =
      searchParams.get('startDate') ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();
    const reportType = searchParams.get('type') || 'comprehensive';

    // Generate report based on type
    const report = await generateReport(reportType, startDate, endDate);

    return NextResponse.json(report);
  } catch (error) {
    console.error('Report generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function generateReport(type, startDate, endDate) {
  const dateRange = {
    gte: new Date(startDate),
    lte: new Date(endDate),
  };

  // Base metrics - always included
  const baseMetrics = await getBaseMetrics(dateRange);

  // Add specific metrics based on report type
  switch (type) {
    case 'financial':
      return {
        ...baseMetrics,
        ...(await getFinancialMetrics(dateRange)),
      };

    case 'enrollment':
      return {
        ...baseMetrics,
        ...(await getEnrollmentMetrics(dateRange)),
      };

    case 'performance':
      return {
        ...baseMetrics,
        ...(await getPerformanceMetrics(dateRange)),
      };

    case 'comprehensive':
    default:
      return {
        ...baseMetrics,
        ...(await getFinancialMetrics(dateRange)),
        ...(await getEnrollmentMetrics(dateRange)),
        ...(await getPerformanceMetrics(dateRange)),
      };
  }
}

async function getBaseMetrics(dateRange) {
  const [totalUsers, newUsers, activeUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        createdAt: dateRange,
      },
    }),
    prisma.user.count({
      where: {
        lastActiveAt: dateRange,
      },
    }),
  ]);

  return {
    summary: {
      totalUsers,
      newUsers,
      activeUsers,
      reportPeriod: {
        start: dateRange.gte,
        end: dateRange.lte,
      },
    },
  };
}

async function getFinancialMetrics(dateRange) {
  const [revenue, orders, refunds] = await Promise.all([
    // Total revenue
    prisma.order.aggregate({
      where: {
        createdAt: dateRange,
        status: 'completed',
      },
      _sum: {
        totalAmount: true,
      },
    }),
    // Order statistics
    prisma.order.groupBy({
      by: ['status'],
      where: {
        createdAt: dateRange,
      },
      _count: true,
    }),
    // Refund data
    prisma.refund.findMany({
      where: {
        createdAt: dateRange,
      },
      select: {
        amount: true,
        reason: true,
      },
    }),
  ]);

  return {
    financial: {
      totalRevenue: revenue._sum.totalAmount || 0,
      orderStats: orders.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.status]: curr._count,
        }),
        {}
      ),
      refunds: {
        total: refunds.reduce((sum, ref) => sum + ref.amount, 0),
        count: refunds.length,
        reasons: refunds.reduce(
          (acc, ref) => ({
            ...acc,
            [ref.reason]: (acc[ref.reason] || 0) + 1,
          }),
          {}
        ),
      },
    },
  };
}

async function getEnrollmentMetrics(dateRange) {
  const [enrollments, completions, activeEnrollments] = await Promise.all([
    // New enrollments
    prisma.enrollment.count({
      where: {
        createdAt: dateRange,
      },
    }),
    // Completed courses
    prisma.enrollment.count({
      where: {
        completedAt: dateRange,
        status: 'completed',
      },
    }),
    // Currently active enrollments
    prisma.enrollment.findMany({
      where: {
        status: 'active',
        validUntil: {
          gt: new Date(),
        },
      },
      include: {
        progress: true,
      },
    }),
  ]);

  // Calculate average progress for active enrollments
  const avgProgress =
    activeEnrollments.reduce((sum, enrollment) => {
      const progress =
        (enrollment.progress.filter((p) => p.status === 'completed').length /
          enrollment.progress.length) *
        100;
      return sum + progress;
    }, 0) / (activeEnrollments.length || 1);

  return {
    enrollment: {
      newEnrollments: enrollments,
      completions,
      activeEnrollments: activeEnrollments.length,
      averageProgress: Math.round(avgProgress),
      progressDistribution: getProgressDistribution(activeEnrollments),
    },
  };
}

async function getPerformanceMetrics(dateRange) {
  const [testResults, assessments] = await Promise.all([
    // Test results
    prisma.testResult.findMany({
      where: {
        completedAt: dateRange,
      },
      select: {
        score: true,
        timeSpent: true,
        testType: true,
      },
    }),
    // Assessment data
    prisma.assessment.findMany({
      where: {
        completedAt: dateRange,
      },
      select: {
        score: true,
        difficulty: true,
        topic: true,
      },
    }),
  ]);

  return {
    performance: {
      testMetrics: calculateTestMetrics(testResults),
      assessmentMetrics: calculateAssessmentMetrics(assessments),
      trends: analyzeTrends(testResults, assessments),
    },
  };
}

// Helper functions
function getProgressDistribution(enrollments) {
  const distribution = {
    '0-25': 0,
    '26-50': 0,
    '51-75': 0,
    '76-100': 0,
  };

  enrollments.forEach((enrollment) => {
    const progress =
      (enrollment.progress.filter((p) => p.status === 'completed').length /
        enrollment.progress.length) *
      100;
    if (progress <= 25) distribution['0-25']++;
    else if (progress <= 50) distribution['26-50']++;
    else if (progress <= 75) distribution['51-75']++;
    else distribution['76-100']++;
  });

  return distribution;
}

function calculateTestMetrics(testResults) {
  return {
    averageScore: calculateAverage(testResults.map((r) => r.score)),
    averageTime: calculateAverage(testResults.map((r) => r.timeSpent)),
    byType: groupByTestType(testResults),
  };
}

function calculateAssessmentMetrics(assessments) {
  return {
    averageScore: calculateAverage(assessments.map((a) => a.score)),
    byDifficulty: groupByDifficulty(assessments),
    byTopic: groupByTopic(assessments),
  };
}

function analyzeTrends(testResults, assessments) {
  // Implement trend analysis logic here
  return {
    scoreProgression: calculateScoreProgression(testResults),
    topicPerformance: analyzeTopicPerformance(assessments),
    // Add more trend analyses as needed
  };
}

function calculateAverage(numbers) {
  return numbers.length
    ? Math.round(numbers.reduce((sum, num) => sum + num, 0) / numbers.length)
    : 0;
}

function groupByTestType(results) {
  return results.reduce(
    (acc, result) => ({
      ...acc,
      [result.testType]: {
        count: (acc[result.testType]?.count || 0) + 1,
        averageScore: (acc[result.testType]?.averageScore || 0) + result.score,
      },
    }),
    {}
  );
}

function groupByDifficulty(assessments) {
  return assessments.reduce(
    (acc, assessment) => ({
      ...acc,
      [assessment.difficulty]: {
        count: (acc[assessment.difficulty]?.count || 0) + 1,
        averageScore:
          (acc[assessment.difficulty]?.averageScore || 0) + assessment.score,
      },
    }),
    {}
  );
}

function groupByTopic(assessments) {
  return assessments.reduce(
    (acc, assessment) => ({
      ...acc,
      [assessment.topic]: {
        count: (acc[assessment.topic]?.count || 0) + 1,
        averageScore:
          (acc[assessment.topic]?.averageScore || 0) + assessment.score,
      },
    }),
    {}
  );
}

function calculateScoreProgression(results) {
  // Sort by date and calculate moving average
  return results
    .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))
    .map((result, index, array) => {
      const window = array.slice(Math.max(0, index - 4), index + 1);
      return {
        date: result.completedAt,
        score: result.score,
        movingAverage: calculateAverage(window.map((w) => w.score)),
      };
    });
}

function analyzeTopicPerformance(assessments) {
  const topicStats = groupByTopic(assessments);

  // Calculate average scores and identify strengths/weaknesses
  return Object.entries(topicStats).map(([topic, stats]) => ({
    topic,
    averageScore: Math.round(stats.averageScore / stats.count),
    attempts: stats.count,
    strength: stats.averageScore / stats.count > 75,
  }));
}
