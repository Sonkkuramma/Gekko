// TestPackCard.jsx

'use client'; // Add this line at the top of the file

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const TestPackCard = ({ testPack }) => {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(testPack.pack_image_url);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!testPack) {
    return null;
  }

  const handleClick = (e) => {
    e.preventDefault();
    router.push(`/${testPack.pack_slug}/details`);
  };

  const getTestInfo = () => {
    if (testPack.tests && testPack.tests.length > 0) {
      const firstTest = testPack.tests[0];
      switch (testPack.pack_type) {
        case 'topic tests':
        case 'module tests':
          return `Questions: ${
            firstTest.details?.question_ids?.split(',').length || 0
          }`;
        case 'section tests':
          return `Module Tests: ${
            firstTest.details?.module_test_ids?.split(',').length || 0
          }`;
        case 'fulllength tests':
          return `Section Tests: ${
            firstTest.details?.section_test_ids?.split(',').length || 0
          }`;
        default:
          return '';
      }
    }
    return '';
  };

  const calculateTestsAndQuestions = (testPack) => {
    let testCount = testPack.tests ? testPack.tests.length : 0;
    let questionCount = 0;

    if (testPack.tests) {
      testPack.tests.forEach((test) => {
        if (test.details) {
          switch (testPack.pack_type) {
            case 'topic tests':
            case 'module tests':
              questionCount +=
                test.details.question_ids?.split(',').length || 0;
              break;
            case 'section tests':
              questionCount +=
                test.details.module_test_ids?.split(',').length || 0;
              break;
            case 'fulllength tests':
              questionCount +=
                test.details.section_test_ids?.split(',').length || 0;
              break;
          }
        }
      });
    }

    return { testCount, questionCount };
  };

  const { testCount, questionCount } = calculateTestsAndQuestions(testPack);

  const fallbackImageSrc =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8Vw8AAmEBb87E6jIAAAAASUVORK5CYII=';

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <div className="bg-white p-2 border rounded-md shadow-md overflow-hidden transition-all duration-300 hover:scale-105 relative">
        <div className="relative h-48">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <Image
              src={imgSrc}
              alt={testPack.pack_name}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
              onError={() => {
                setImgSrc(fallbackImageSrc);
              }}
            />
          )}
          {!isLoading && testPack.is_premium === 0 && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold">
              FREE
            </div>
          )}
        </div>
        <div className="px-2 pt-2">
          {isLoading ? (
            <>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </>
          ) : (
            <>
              <h2 className="text-md font-bold">{testPack.pack_name}</h2>
              <div className="flex flex-wrap gap-1">
                {testPack.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-indigo-100 text-gray-800 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tests: {testCount} | {getTestInfo()}
              </p>
              <p className="text-xs text-gray-500">
                Total Items: {questionCount}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPackCard;
