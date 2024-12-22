import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { sessionClaims } = auth();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // Check authorization
    if (
      !sessionClaims?.metadata?.role === 'admin' &&
      sessionClaims?.userId !== userId
    ) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch enrollments - replace with your actual data fetching logic
    const enrollments = await prisma.enrollments.findMany({
      where: {
        userId: userId,
      },
      include: {
        testPack: true,
        progress: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate additional metrics
    const enrichedEnrollments = enrollments.map((enrollment) => {
      const progressPercentage = calculateProgress(enrollment.progress);
      const daysRemaining = calculateDaysRemaining(enrollment.validUntil);

      return {
        ...enrollment,
        progressPercentage,
        daysRemaining,
        status: getEnrollmentStatus(enrollment),
      };
    });

    return NextResponse.json({
      enrollments: enrichedEnrollments,
      totalCount: enrichedEnrollments.length,
    });
  } catch (error) {
    console.error('Enrollment fetch error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Helper functions
function calculateProgress(progress) {
  if (!progress || !progress.length) return 0;
  const completed = progress.filter((p) => p.status === 'completed').length;
  return Math.round((completed / progress.length) * 100);
}

function calculateDaysRemaining(validUntil) {
  const now = new Date();
  const endDate = new Date(validUntil);
  const diffTime = endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getEnrollmentStatus(enrollment) {
  if (new Date(enrollment.validUntil) < new Date()) {
    return 'expired';
  }
  if (enrollment.progress.every((p) => p.status === 'completed')) {
    return 'completed';
  }
  return 'active';
}
