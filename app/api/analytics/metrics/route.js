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

    let dateFilter;
    switch (timeframe) {
      case '7days':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case '90days':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 90 DAY)';
        break;
      case '1year':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 1 YEAR)';
        break;
      default:
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    // Get revenue metrics
    const [revenueResult] = await db.execute(`
      SELECT 
        SUM(total_amount) as current_revenue,
        (
          SELECT SUM(total_amount) 
          FROM orders 
          WHERE status = 'completed' 
          AND created_at BETWEEN DATE_SUB(${dateFilter}, INTERVAL 30 DAY) AND ${dateFilter}
        ) as previous_revenue
      FROM orders 
      WHERE status = 'completed'
      AND created_at >= ${dateFilter}
    `);

    // Get user metrics
    const [userResult] = await db.execute(`
      SELECT 
        COUNT(DISTINCT user_id) as active_users,
        (
          SELECT COUNT(DISTINCT user_id) 
          FROM user_activity_logs
          WHERE created_at BETWEEN DATE_SUB(${dateFilter}, INTERVAL 30 DAY) AND ${dateFilter}
        ) as previous_active_users
      FROM user_activity_logs
      WHERE created_at >= ${dateFilter}
    `);

    // Get enrollment metrics
    const [enrollmentResult] = await db.execute(`
      SELECT 
        COUNT(*) as total_enrollments,
        (
          SELECT COUNT(*) 
          FROM enrollments
          WHERE created_at BETWEEN DATE_SUB(${dateFilter}, INTERVAL 30 DAY) AND ${dateFilter}
        ) as previous_enrollments,
        AVG(
          CASE 
            WHEN status = 'completed' THEN 100
            WHEN status = 'in_progress' THEN progress
            ELSE 0
          END
        ) as completion_rate
      FROM enrollments
      WHERE created_at >= ${dateFilter}
    `);

    const { current_revenue, previous_revenue } = revenueResult[0];

    const { active_users, previous_active_users } = userResult[0];

    const { total_enrollments, previous_enrollments, completion_rate } =
      enrollmentResult[0];

    // Calculate percentage changes
    const revenueChange = previous_revenue
      ? ((current_revenue - previous_revenue) / previous_revenue) * 100
      : 0;

    const userChange = previous_active_users
      ? ((active_users - previous_active_users) / previous_active_users) * 100
      : 0;

    const enrollmentChange = previous_enrollments
      ? ((total_enrollments - previous_enrollments) / previous_enrollments) *
        100
      : 0;

    return NextResponse.json({
      revenue: current_revenue || 0,
      revenueChange: parseFloat(revenueChange.toFixed(2)),
      activeUsers: active_users || 0,
      userChange: parseFloat(userChange.toFixed(2)),
      enrollments: total_enrollments || 0,
      enrollmentChange: parseFloat(enrollmentChange.toFixed(2)),
      completionRate: parseFloat(completion_rate?.toFixed(2)) || 0,
    });
  } catch (error) {
    console.error('Analytics metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics metrics' },
      { status: 500 }
    );
  }
}
