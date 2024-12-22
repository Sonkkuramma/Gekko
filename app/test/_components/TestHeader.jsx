'use client';

import { Timer } from 'lucide-react';
import PropTypes from 'prop-types';

export function TestHeader({
  topicName = '',
  testName = '',
  currentQuestion = 1,
  totalQuestions = 1,
  timeLeft = 0,
}) {
  // Ensure current question is within valid range
  const validCurrentQuestion = Math.max(
    1,
    Math.min(currentQuestion, totalQuestions)
  );

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{topicName}</h2>
        <span className="text-lg font-semibold">{testName}</span>
      </div>

      <div className="h-px bg-border" />

      <div className="flex justify-between items-center bg-primary/10 px-4 py-2 rounded-md">
        <div className="text-sm font-medium">
          Question: {validCurrentQuestion} of {totalQuestions}
        </div>
        <div className="flex items-center gap-2 bg-background px-3 py-1 rounded-md shadow-sm">
          <Timer className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{formatTime(timeLeft)}</span>
        </div>
      </div>
    </div>
  );
}

TestHeader.propTypes = {
  topicName: PropTypes.string,
  testName: PropTypes.string,
  currentQuestion: PropTypes.number,
  totalQuestions: PropTypes.number,
  timeLeft: PropTypes.number,
};
