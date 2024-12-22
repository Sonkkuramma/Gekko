'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import PropTypes from 'prop-types';

const letters = ['A', 'B', 'C', 'D'];

export function QuestionCard({
  question,
  selectedOption,
  onOptionSelect,
  disabled = false,
}) {
  // Determine if answer is locked (when any option is selected)
  const isAnswerLocked =
    selectedOption !== null && selectedOption !== undefined;

  if (!question) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            Question data is missing
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasValidStructure =
    question.id &&
    question.question &&
    Array.isArray(question.options) &&
    question.options.length > 0 &&
    question.correctAnswer;

  if (!hasValidStructure) {
    console.error('Invalid question structure:', question);
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <div>Question format is invalid</div>
            <div className="text-sm mt-2">
              Expected: id, question text, options array, and correctAnswer
            </div>
            <div className="text-sm mt-1 text-gray-400">
              Received: {JSON.stringify(question, null, 2)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleOptionSelect = (optionIndex, index) => {
    // Only allow selection if answer isn't locked and component isn't disabled
    if (!isAnswerLocked && !disabled) {
      onOptionSelect?.(optionIndex, index);
    }
  };

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="prose max-w-none">
          <div
            className="text-lg mb-6"
            dangerouslySetInnerHTML={{
              __html: question.question,
            }}
          />
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isOptionDisabled = disabled || isAnswerLocked;

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index.toString(), index)}
                disabled={isOptionDisabled}
                type="button"
                aria-selected={isSelected}
                className={`w-full text-left relative
                  ${isSelected ? 'border-primary bg-primary/5' : 'border-input'}
                  ${isOptionDisabled ? 'opacity-75' : 'hover:bg-muted/50'}
                  flex items-center p-4 rounded-lg border transition-colors`}
              >
                <span className="font-medium text-base min-w-[24px]">
                  {letters[index]}.
                </span>
                <span
                  className="pl-4 flex-grow"
                  dangerouslySetInnerHTML={{ __html: option }}
                />
                {isSelected && isAnswerLocked && (
                  <Lock className="h-4 w-4 text-gray-400 absolute right-4" />
                )}
              </button>
            );
          })}
        </div>

        {isAnswerLocked && (
          <div className="mt-4 text-sm text-gray-500 flex items-center justify-end">
            <Lock className="h-4 w-4 mr-2" />
            Answer locked
          </div>
        )}
      </CardContent>
    </Card>
  );
}

QuestionCard.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    correctAnswer: PropTypes.string.isRequired,
  }),
  selectedOption: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onOptionSelect: PropTypes.func,
  disabled: PropTypes.bool,
};

export default QuestionCard;
