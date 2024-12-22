// app/test/_components/ProgressIndicator.jsx
// ProgressIndicator.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { Minus, Check, X } from 'lucide-react';

export function ProgressIndicator({ answers, total, current }) {
  const [indicatorColors, setIndicatorColors] = useState(
    Array(total).fill('bg-gray-300')
  );
  const [indicatorIcons, setIndicatorIcons] = useState(
    Array(total).fill('minus')
  );
  const [borderColors, setBorderColors] = useState(
    Array(total).fill('border-gray-200')
  );

  useEffect(() => {
    const newColors = [];
    const newIcons = [];
    const newBorderColors = [];

    for (let i = 0; i < total; i++) {
      const answer = answers[i];

      if (!answer || answer.status === 'unanswered') {
        newColors.push('bg-gray-300');
        newIcons.push('minus');
        newBorderColors.push('border-gray-500');
      } else if (answer.status === 'skipped') {
        newColors.push('bg-gray-500');
        newIcons.push('minus');
        newBorderColors.push('border-gray-700');
      } else if (answer.status === 'correct') {
        newColors.push('bg-green-500');
        newIcons.push('correct');
        newBorderColors.push('border-green-700');
      } else if (answer.status === 'wrong') {
        newColors.push('bg-red-500');
        newIcons.push('wrong');
        newBorderColors.push('border-red-700');
      }
    }

    setIndicatorColors(newColors);
    setIndicatorIcons(newIcons);
    setBorderColors(newBorderColors);
  }, [answers, total]);

  return (
    <div className="py-4">
      <div className="flex flex-wrap justify-start border-2 border-blue-100 p-2 rounded-md shadow-md">
        {Array(total)
          .fill(null)
          .map((_, index) => (
            <div
              key={index}
              className={`
              rounded-full m-1 flex items-center justify-center 
              ${indicatorColors[index]} 
              ${borderColors[index]} 
              border-2 w-8 h-8
              ${current === index ? 'ring-2 ring-blue-500' : ''}
            `}
            >
              {indicatorIcons[index] === 'minus' && (
                <Minus className="w-4 h-4 text-white" />
              )}
              {indicatorIcons[index] === 'correct' && (
                <Check className="w-4 h-4 text-white" />
              )}
              {indicatorIcons[index] === 'wrong' && (
                <X className="w-4 h-4 text-white" />
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
