'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BarChart, Clock, Trophy, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';

export default function EnrollmentTracking() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  async function fetchEnrollments() {
    try {
      setLoading(true);
      const response = await fetch('/api/user/enrollments');
      if (!response.ok) throw new Error('Failed to fetch enrollments');
      const data = await response.json();
      setEnrollments(data.enrollments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getDaysRemaining(expiryDate) {
    const remaining = Math.ceil(
      (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, remaining);
  }

  function getProgressColor(progress) {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (enrollments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500 mb-4">No active enrollments found</p>
          <Button onClick={() => router.push('/test-packs')}>
            Browse Test Packs
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {enrollments.map((enrollment) => (
        <Card key={enrollment.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{enrollment.testPack.name}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {getDaysRemaining(enrollment.expires_at)} days remaining
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Expires on{' '}
                    {new Date(enrollment.expires_at).toLocaleDateString()}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-500">
                  {enrollment.progress.overall}%
                </span>
              </div>
              <Progress
                value={enrollment.progress.overall}
                className={getProgressColor(enrollment.progress.overall)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BarChart className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Tests Completed</span>
                </div>
                <p className="text-2xl font-bold">
                  {enrollment.progress.testsCompleted}/
                  {enrollment.progress.totalTests}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Avg Score</span>
                </div>
                <p className="text-2xl font-bold">
                  {enrollment.progress.averageScore}%
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Areas to Improve</span>
                </div>
                <p className="text-2xl font-bold">
                  {enrollment.progress.improvementAreas}
                </p>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() =>
                router.push(`/test-packs/${enrollment.testPack.slug}`)
              }
            >
              Continue Learning
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
