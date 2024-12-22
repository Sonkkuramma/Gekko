'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const TestPackProgressCard = ({
  userId,
  initialProgress = 0,
  finalProgress = 75,
  testsCompleted = 15,
  totalTests = 20,
}) => {
  const [progress, setProgress] = useState(initialProgress);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(finalProgress), 500);
    return () => clearTimeout(timer);
  }, [finalProgress]);

  return (
    <Card className="flex flex-col mb-4 rounded-sm">
      <CardHeader className="items-center pb-0">
        <CardTitle>Test Pack Progress</CardTitle>
        {/* <CardDescription>Your learning journey</CardDescription> */}
      </CardHeader>
      <CardContent className="flex-1 mt-2 mb-1 mx-3 py-1 border-2 rounded-sm">
        <div className="flex items-center gap-4 w-full">
          <div className="flex-grow bg-emerald-200 rounded-full h-2.5 dark:bg-emerald-200">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-md font-bold text-emerald-500 whitespace-nowrap">
            {Math.round(progress)}%
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm mt-2">
        {/* <div className="flex items-center gap-2 font-medium leading-none">
          {testsCompleted} of {totalTests} tests completed{' '}
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </div> */}
        <div className="leading-none  text-center">
          Keep going!<br></br> You're making great progress.
        </div>
      </CardFooter>
    </Card>
  );
};

export default TestPackProgressCard;
