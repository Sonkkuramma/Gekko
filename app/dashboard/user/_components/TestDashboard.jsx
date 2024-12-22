import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const TestDashboard = () => {
  const mockTestData = {
    currentTest: {
      id: '3G84',
      title: 'Mathematics Section Test',
      timeRemaining: 2400, // 40 minutes in seconds
      totalQuestions: 30,
      answeredQuestions: 18,
      status: 'in_progress',
    },
    recentTests: [
      {
        id: 'CUNE',
        title: 'Linear Equations',
        score: 85,
        completedAt: '2024-11-06T15:30:00Z',
        type: 'topic',
      },
      {
        id: '6FGE',
        title: 'Algebra Module',
        score: 72,
        completedAt: '2024-11-05T14:20:00Z',
        type: 'module',
      },
    ],
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Active Test Section */}
      {mockTestData.currentTest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Test</span>
              <div className="flex items-center text-sm font-normal">
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(mockTestData.currentTest.timeRemaining)}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {mockTestData.currentTest.title}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{`${mockTestData.currentTest.answeredQuestions}/${mockTestData.currentTest.totalQuestions} Questions`}</span>
                </div>
                <Progress
                  value={
                    (mockTestData.currentTest.answeredQuestions /
                      mockTestData.currentTest.totalQuestions) *
                    100
                  }
                  className="h-2"
                />
              </div>
              <Button className="w-full">Resume Test</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Tests Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTestData.recentTests.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <h4 className="font-medium">{test.title}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(test.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div
                    className={`px-3 py-1 rounded-full text-white text-sm ${getProgressColor(
                      test.score
                    )}`}
                  >
                    {test.score}%
                  </div>
                  {test.score >= 80 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : test.score >= 60 ? (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDashboard;
