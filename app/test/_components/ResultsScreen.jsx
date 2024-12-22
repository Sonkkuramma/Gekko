'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Timer,
  Users,
  Star,
  Award,
  ChevronLeft,
  RotateCcw,
  Eye,
} from 'lucide-react';

const formatTime = (seconds) => {
  if (isNaN(seconds)) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
};

const StatCard = ({ title, value, icon, className = '' }) => (
  <Card className={`bg-white rounded-sm border-gray-200 ${className}`}>
    <CardContent className="p-3">
      <div className="flex items-center justify-between mb-2">
        {icon}
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <p className="text-sm text-center">{value || '-'}</p>
    </CardContent>
  </Card>
);

const TableHeader = ({ title }) => (
  <th className="p-1 text-center text-sm whitespace-nowrap">
    <div className="bg-primary text-white border rounded-sm shadow-sm px-2 py-1">
      {title}
    </div>
  </th>
);

const TableCell = ({ children }) => (
  <td className="p-1 text-center text-sm whitespace-nowrap">
    <div className="bg-white border rounded-sm shadow-sm px-2 py-1">
      {children}
    </div>
  </td>
);

const StatusIcon = ({ status }) => {
  const icons = {
    correct: '/correct.webp',
    wrong: '/wrong.webp',
    skipped: '/minus.webp',
  };

  const colors = {
    correct: 'bg-green-500 border-green-700',
    wrong: 'bg-red-500 border-red-700',
    skipped: 'bg-gray-500 border-gray-700',
  };

  return (
    <div className="flex justify-center">
      <img
        src={icons[status]}
        alt={status}
        className={`w-5 h-5 p-1 rounded-sm border-2 ${colors[status]}`}
      />
    </div>
  );
};

export function ResultsScreen({ results, currentUrl }) {
  if (!results) return null;

  // Calculate total questions from questionDetails length instead of questions array
  const totalQuestions = results.questionDetails?.length || 0;

  const {
    answered = 0,
    skipped = 0,
    correct = 0,
    wrong = 0,
    accuracy = 0,
    score = 0,
    totalTime = 0,
    avgTimePerQuestion = 0,
    avgTimePerCorrectAnswer = 0,
    questionDetails = [],
  } = results;

  return (
    <Card className="my-3 ms-2 rounded-sm">
      <div className="max-w mx-auto p-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <StatCard
            title="Questions"
            value={totalQuestions}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            title="Answered"
            value={answered}
            icon={<Award className="h-5 w-5" />}
          />
          <StatCard
            title="Skipped"
            value={skipped}
            icon={<Timer className="h-5 w-5" />}
          />
          <StatCard
            title="Correct"
            value={correct}
            icon={<Award className="h-5 w-5 text-green-500" />}
          />
          <StatCard
            title="Wrong"
            value={wrong}
            icon={<Award className="h-5 w-5 text-red-500" />}
          />
          <StatCard
            title="Accuracy"
            value={`${accuracy}%`}
            icon={<Star className="h-5 w-5 text-yellow-500" />}
          />
          <StatCard
            title="Score"
            value={score}
            icon={<Award className="h-5 w-5 text-primary" />}
          />
          <StatCard
            title="Total Time"
            value={formatTime(totalTime)}
            icon={<Timer className="h-5 w-5" />}
          />
          <StatCard
            title="Avg Time / Question"
            value={formatTime(avgTimePerQuestion)}
            icon={<Timer className="h-5 w-5" />}
            className="col-span-2"
          />
          <StatCard
            title="Avg Time / Correct Answer"
            value={formatTime(avgTimePerCorrectAnswer)}
            icon={<Timer className="h-5 w-5" />}
            className="col-span-2"
          />
        </div>

        {/* Questions Table */}
        <Card className="mt-4 pt-2 rounded-sm">
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <TableHeader title="#" />
                    <TableHeader title="Question Snippet" />
                    <TableHeader title="Answer" />
                    <TableHeader title="Difficulty" />
                    <TableHeader title="Time (sec)" />
                  </tr>
                </thead>
                <tbody>
                  {questionDetails.map((question, index) => (
                    <tr key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{question.snippet}</TableCell>
                      <TableCell>
                        <StatusIcon status={question.status} />
                      </TableCell>
                      <TableCell>{question.difficulty}</TableCell>
                      <TableCell>{question.time}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-2 rounded-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2 rounded-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Reload
          </Button>

          <Button
            onClick={() => window.open(`${currentUrl}/solution`, '_blank')}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white rounded-sm"
          >
            <Eye className="h-4 w-4" />
            View Solution
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default ResultsScreen;
