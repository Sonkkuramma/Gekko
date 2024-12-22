'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const TestPackBundleCard = ({ bundle }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState('/demoimg1.png');
  const [visibleTags, setVisibleTags] = useState([]);
  const [hiddenTags, setHiddenTags] = useState([]);
  const tagsContainerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (bundle.bundle_image_url) {
      // Ensure the image URL starts with a forward slash
      const formattedImageUrl = bundle.bundle_image_url.startsWith('/')
        ? bundle.bundle_image_url
        : `/${bundle.bundle_image_url}`;
      setImgSrc(formattedImageUrl);
    }
  }, [bundle.bundle_image_url]);

  useEffect(() => {
    if (!isLoading) {
      adjustVisibleTags();
      window.addEventListener('resize', adjustVisibleTags);
      return () => window.removeEventListener('resize', adjustVisibleTags);
    }
  }, [isLoading, bundle.pack_types]);

  const adjustVisibleTags = () => {
    if (!tagsContainerRef.current) return;

    const containerWidth = tagsContainerRef.current.offsetWidth;
    let totalWidth = 0;
    let visibleCount = 0;

    const tempDiv = document.createElement('div');
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.position = 'absolute';
    tempDiv.style.whiteSpace = 'nowrap';
    document.body.appendChild(tempDiv);

    const tags = bundle.pack_types || [];

    for (let i = 0; i < tags.length; i++) {
      tempDiv.textContent = tags[i];
      const tagWidth = tempDiv.offsetWidth + 16; // Add some padding

      if (totalWidth + tagWidth > containerWidth) {
        break;
      }

      totalWidth += tagWidth;
      visibleCount++;
    }

    if (visibleCount < tags.length) {
      tempDiv.textContent = `+${tags.length - visibleCount + 1}`;
      const plusTagWidth = tempDiv.offsetWidth + 16;

      while (totalWidth + plusTagWidth > containerWidth && visibleCount > 0) {
        tempDiv.textContent = tags[visibleCount - 1];
        totalWidth -= tempDiv.offsetWidth + 16;
        visibleCount--;
      }
    }

    document.body.removeChild(tempDiv);

    setVisibleTags(tags.slice(0, visibleCount));
    setHiddenTags(tags.slice(visibleCount));
  };

  const fallbackImageSrc =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8Vw8AAmEBb87E6jIAAAAASUVORK5CYII=';

  return (
    <Link href={`/bundle/${bundle.bundle_slug}/details`}>
      <div className="bg-white p-2 border rounded-md shadow-md overflow-hidden transition-all duration-300 hover:scale-105 relative">
        <div className="relative h-48">
          {isLoading ? (
            <Skeleton className="h-full w-full rounded-md" />
          ) : (
            <Image
              src={imgSrc}
              alt={bundle.bundle_name}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
              onError={() => {
                setImgSrc(fallbackImageSrc);
              }}
            />
          )}
        </div>
        <div className="px-2 pt-2">
          {isLoading ? (
            <>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <div className="flex flex-wrap gap-2 mb-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-4 w-1/3" />
            </>
          ) : (
            <>
              <h2 className="text-md font-bold">{bundle.bundle_name}</h2>
              <div
                ref={tagsContainerRef}
                className="flex flex-wrap gap-2 mb-2 h-6 overflow-hidden"
              >
                {visibleTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-indigo-100 text-gray-800 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {hiddenTags.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded whitespace-nowrap cursor-pointer">
                          +{hiddenTags.length}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <ul>
                          {hiddenTags.map((tag, index) => (
                            <li key={index}>{tag}</li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Exam: {bundle.exam_id}
              </p>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TestPackBundleCard;
