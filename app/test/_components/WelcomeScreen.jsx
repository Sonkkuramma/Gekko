'use client';

import {
  Users,
  Clock,
  Timer,
  Award,
  Star,
  Gauge,
  ChevronDown,
  ChevronUp,
  CircleOff,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import PropTypes from 'prop-types';

export function WelcomeScreen({ testData, onStart }) {
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(true);

  if (!testData) return null;

  const { topicName, testName, questionCount, timePerQuestion, difficulty } =
    testData;
  const totalTime = questionCount * timePerQuestion;
  const minutes = Math.floor(totalTime / 60);
  const seconds = totalTime % 60;
  const totalTimeMessage = `${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;

  return (
    <div className=" bg-gray-100 relative overflow-hidden my-3 ms-2 rounded-sm shadow-lg py-2">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 transform -skew-y-6 origin-top-left z-0"></div>
      <div className="relative z-10 p-8 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">{testName}</h1>
            <p className="text-blue-100 mb-6">{topicName}</p>
            <Button
              onClick={onStart}
              className="bg-white text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Start Quiz
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, title: 'Questions', value: questionCount },
              {
                icon: Timer,
                title: 'Time / Question',
                value: `${timePerQuestion}s`,
              },
              { icon: Clock, title: 'Total Duration', value: totalTimeMessage },
              { icon: Gauge, title: 'Difficulty', value: difficulty },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-sm shadow-lg flex items-center space-x-3"
              >
                <div className="bg-blue-100 p-2 rounded-sm">
                  <item.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-500">
                    {item.title}
                  </h2>
                  <p className="text-lg font-bold text-gray-800">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 bg-white rounded-sm shadow-lg overflow-hidden">
          <button
            onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
            className="w-full px-6 py-4 flex items-center justify-between text-left"
          >
            <span className="font-bold text-lg">Quiz Instructions</span>
            {isInstructionsOpen ? (
              <ChevronUp className="h-6 w-6 text-gray-400" />
            ) : (
              <ChevronDown className="h-6 w-6 text-gray-400" />
            )}
          </button>
          {isInstructionsOpen && (
            <div className="px-6 pb-4">
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Answer cannot be changed once selected</li>
                <li>Question navigation is unavailable</li>
              </ul>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-between items-center bg-white p-6 rounded-sm shadow-lg">
          <div className="flex items-center space-x-4">
            <Star className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Correct Answer</p>
              <p className="font-bold text-gray-800">+1 point</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <CircleOff className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-500">Wrong / Skipped</p>
              <p className="font-bold text-gray-800">0 points</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

WelcomeScreen.propTypes = {
  testData: PropTypes.shape({
    topicName: PropTypes.string.isRequired,
    testName: PropTypes.string.isRequired,
    questionCount: PropTypes.number.isRequired,
    timePerQuestion: PropTypes.number.isRequired,
    difficulty: PropTypes.string.isRequired,
  }),
  onStart: PropTypes.func.isRequired,
};
