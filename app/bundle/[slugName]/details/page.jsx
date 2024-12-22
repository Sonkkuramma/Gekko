import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import TestPackCard from '@/app/_components/testPack/TestPackCard';
import EnrollmentSection from '@/app/_components/EnrollmentSection';
import { getTestPackBundles, getTestPacks } from '@/lib/db';
import bundleDescriptions from '@/public/data/bundleDescriptions.json';

export async function generateMetadata({ params }) {
  const bundles = await getTestPackBundles();
  const bundle = bundles.find((b) => b.bundle_slug === params.slugName);
  if (!bundle) {
    return {
      title: 'Bundle Not Found',
    };
  }
  return {
    title: `${bundle.bundle_name} | PandaPrep`,
    description: bundle.bundle_short_description,
  };
}

function generateDetailedDescription(template, bundle, testPackCount) {
  const tagsString = bundle.tags
    ? Array.isArray(bundle.tags)
      ? bundle.tags.join(' and ')
      : bundle.tags.split(',').join(' and ')
    : '';

  return template
    .replace('{bundleName}', bundle.bundle_name)
    .replace(/{exam}/g, bundle.exam_id)
    .replace('{testPackCount}', testPackCount)
    .replace('{tags}', tagsString);
}

export default async function BundleDetailsPage({ params }) {
  const bundles = await getTestPackBundles();
  const bundle = bundles.find((b) => b.bundle_slug === params.slugName);

  if (!bundle) {
    notFound();
  }

  console.log('Bundle pack_ids:', bundle.pack_ids, typeof bundle.pack_ids);

  const allTestPacks = await getTestPacks();

  // Handle both string and array cases for pack_ids
  let packIdsArray = [];
  if (bundle.pack_ids) {
    packIdsArray = Array.isArray(bundle.pack_ids)
      ? bundle.pack_ids
      : typeof bundle.pack_ids === 'string'
      ? bundle.pack_ids.split(',')
      : [];
  }

  // Filter test packs based on pack_ids
  const bundleTestPacks = allTestPacks.filter((tp) =>
    packIdsArray.includes(tp.pack_id)
  );

  // Handle both string and array cases for tags
  const tagsArray = bundle.tags
    ? Array.isArray(bundle.tags)
      ? bundle.tags
      : bundle.tags.split(',')
    : [];

  const bundleDescription = bundleDescriptions[bundle.bundle_slug] || {
    shortDescription: bundle.bundle_short_description || '',
    detailedDescriptionTemplate:
      'Detailed description for {bundleName} is not available.',
  };

  const detailedDescription = generateDetailedDescription(
    bundleDescription.detailedDescriptionTemplate,
    bundle,
    bundleTestPacks.length
  );

  const visibleTags = tagsArray.slice(0, 4);
  const hiddenTags = tagsArray.slice(4);

  return (
    <div className="container mx-auto px-4 py-2">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <Card className="mb-8 rounded-md">
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {bundle.bundle_name}
                </CardTitle>
                <CardDescription>{bundle.exam_id} Preparation</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                {visibleTags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-md"
                  >
                    {tag.trim()}
                  </span>
                ))}
                {hiddenTags.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-md cursor-pointer">
                          +{hiddenTags.length}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{hiddenTags.map((tag) => tag.trim()).join(', ')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 mb-4">
                <Image
                  src={bundle.bundle_image_url || '/placeholder-image.jpg'}
                  alt={bundle.bundle_name}
                  fill
                  className="rounded-md object-cover"
                  priority
                />
              </div>
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="testpacks">
                    Test Packs ({bundleTestPacks.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="description">
                  <div className="mt-4 space-y-4">
                    <h3 className="text-lg font-semibold">
                      Bundle Description
                    </h3>
                    <p className="whitespace-pre-line">{detailedDescription}</p>
                  </div>
                </TabsContent>
                <TabsContent value="testpacks">
                  <div className="mt-4 grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                    {bundleTestPacks.map((testPack) => (
                      <TestPackCard
                        key={testPack.pack_id}
                        testPack={testPack}
                        className="h-full"
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-1/3">
          <EnrollmentSection bundle={bundle} />

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Bundle Progress</CardTitle>
              <CardDescription>Your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Overall bundle progress and statistics will be shown here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
