import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnrollmentSection from '@/app/_components/EnrollmentSection';
import { getTestPackBySlug } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import TestPackProgressCard from '../../_components/TestPackProgressCard';

export async function generateMetadata({ params }) {
  const testPack = await getTestPackBySlug(params.slug);
  if (!testPack) {
    return {
      title: 'Test Pack Not Found',
    };
  }
  return {
    title: `${testPack.pack_name} | GekkoPrep`,
    description: testPack.pack_short_description,
  };
}

export default async function TestPackDetailsPage({ params }) {
  const { userId } = auth();
  const testPack = await getTestPackBySlug(params.slug);

  if (!testPack) {
    notFound();
  }

  return (
    <div className="flex-grow ps-2 py-3">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:flex-grow">
          <Card className="mb-8 rounded-sm">
            <CardHeader className="px-6 pt-6 pb-1">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold">
                    {testPack.pack_name}
                  </CardTitle>
                  <CardDescription>
                    {testPack.exam_id} {testPack.pack_type.replace('_', ' ')} -{' '}
                    {testPack.pack_difficulty}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {testPack.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 mb-4">
                <Image
                  src={testPack.pack_image_url || '/placeholder-image.png'}
                  alt={testPack.pack_name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-sm"
                />
              </div>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  <div className="mt-4 space-y-4">
                    <h3 className="text-lg font-semibold">
                      Test Pack Overview
                    </h3>
                    <p>{testPack.pack_short_description}</p>
                  </div>
                </TabsContent>
                <TabsContent value="details">
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Detailed Description
                    </h3>
                    <p className="whitespace-pre-line">
                      {testPack.pack_long_description}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-2/5 lg:min-w-[250px]">
          <EnrollmentSection testPack={testPack} />

          {userId && (
            <Card className="mb-4 rounded-sm">
              <CardHeader>
                <CardTitle>Test Pack Progress</CardTitle>
                <CardDescription>Your learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Overall Test Pack progress and statistics will be shown here.
                </p>
                {/* TODO: Implement actual progress tracking */}
              </CardContent>
            </Card>
          )}
          {userId && (
            <TestPackProgressCard
              userId={userId}
              initialProgress={0} // Starting progress for animation
              finalProgress={75} // Final progress to animate to
              testsCompleted={15}
              totalTests={20}
            />
          )}

          {testPack.is_premium && (
            <Card className="mb-4 rounded-sm">
              <CardHeader>
                <CardTitle>Premium Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Unlimited access to all Test Pack materials</li>
                  <li>Personalized study plan</li>
                  <li>Priority support from instructors</li>
                  <li>Exclusive practice tests</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
