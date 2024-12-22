import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';

export async function GET(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30days';

    let interval, dateFormat;
    switch (timeframe) {
      case '7days':
        interval = 'INTERVAL 7 DAY';
        dateFormat = '%Y-%m-%d';
        break;
      case '90days':
        interval = 'INTERVAL 90 DAY';
        dateFormat = '%Y-%m-%d';
        break;
      case '1year':
        interval = 'INTERVAL 1 YEAR';
        dateFormat = '%Y-%m';
        break;
      default:
        interval = 'INTERVAL 30 DAY';
        dateFormat = '%Y-%m-%d';
    }

    // Get revenue trend
    const [revenueTrend] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, '${dateFormat}') as date,
        SUM(total_amount) as amount
      FROM orders
      WHERE status = 'completed'
      AND created_at >= DATE_SUB(NOW(), ${interval})
      GROUP BY DATE_FORMAT(created_at, '${dateFormat}')
      ORDER BY date ASC
    `);

    // Get user activity trend
    const [userTrend] = await db.execute(`
      SELECT 
        DATE_FORMAT(log_date, '${dateFormat}') as date,
        COUNT(DISTINCT user_id) as activeUsers,
        SUM(CASE WHEN is_new_user = 1 THEN 1 ELSE 0 END) as newUsers
      FROM user_activity_logs
      WHERE log_date >= DATE_SUB(NOW(), ${interval})
      GROUP BY DATE_FORMAT(log_date, '${dateFormat}')
      ORDER BY date ASC
    `);

    // Get test pack performance
    const [testPackPerformance] = await db.execute(`
      SELECT 
        tp.name,
        COUNT(DISTINCT e.id) as enrollments,
        COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END) as completions
      FROM test_packs tp
      LEFT JOIN enrollments e ON e.test_pack_id = tp.id
      WHERE e.created_at >= DATE_SUB(NOW(), ${interval})
      GROUP BY tp.id, tp.name
      ORDER BY enrollments DESC
      LIMIT 10
    `);

    // Get enrollment trend
    const [enrollmentTrend] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, '${dateFormat}') as date,
        COUNT(*) as count
      FROM enrollments
      WHERE created_at >= DATE_SUB(NOW(), ${interval})
      GROUP BY DATE_FORMAT(created_at, '${dateFormat}')
      ORDER BY date ASC
    `);

    return NextResponse.json({
      revenue: revenueTrend,
      userActivity: userTrend,
      testPackPerformance: testPackPerformance,
      enrollments: enrollmentTrend,
    });
  } catch (error) {
    console.error('Analytics trends error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics trends' },
      { status: 500 }
    );
  }
}
