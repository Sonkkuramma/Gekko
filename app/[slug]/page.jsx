// app/[slug]/page.jsx
import { notFound } from 'next/navigation';
import TestPackPage from './TestPackPage';
import Loading from './loading';
import { Suspense } from 'react';
import { getTestPackBySlug } from '@/lib/db';
import { getTopicTests } from '@/lib/repositories/topicTestRepository';
import { getModuleTests } from '@/lib/repositories/moduleTestRepository';
import { getSectionTests } from '@/lib/repositories/sectionTestRepository';

async function getTestPackData(slug) {
  try {
    // Get basic test pack information
    const testPack = await getTestPackBySlug(slug);

    if (!testPack) {
      return null;
    }

    console.log('Fetched test pack:', testPack);

    // Initialize the data structure
    let tests = [];

    // Fetch specific test data based on pack type
    try {
      switch (testPack.pack_type) {
        case 'topic tests':
          tests = await getTopicTests(testPack.pack_id);
          break;
        case 'module tests':
          tests = await getModuleTests(testPack.pack_id);
          break;
        case 'section tests':
          tests = await getSectionTests(testPack.pack_id);
          break;
        case 'fulllength tests':
          // TODO: Implement full length tests fetching
          throw new Error('Full length tests not implemented yet');
        default:
          throw new Error(`Unknown pack type: ${testPack.pack_type}`);
      }
    } catch (testError) {
      console.error(`Error fetching ${testPack.pack_type}:`, testError);
      throw new Error(
        `Failed to fetch tests for ${testPack.pack_type}: ${testError.message}`
      );
    }

    // Combine the test pack info with the test data
    return {
      id: testPack.pack_id,
      name: testPack.pack_name,
      slug: testPack.pack_slug,
      description: testPack.pack_long_description,
      shortDescription: testPack.pack_short_description,
      pack_type: testPack.pack_type,
      is_premium: Boolean(testPack.is_premium),
      imageUrl: testPack.pack_image_url,
      bannerUrl: testPack.pack_banner_url,
      tags: testPack.tags || [],
      data: tests,
    };
  } catch (error) {
    console.error('Error in getTestPackData:', error);
    throw error;
  }
}

export async function generateMetadata({ params }) {
  try {
    const testPack = await getTestPackBySlug(params.slug);

    if (!testPack) {
      return {
        title: 'Test Pack Not Found',
        description: 'The requested test pack could not be found.',
      };
    }

    return {
      title: testPack.pack_name,
      description: testPack.pack_short_description,
      openGraph: {
        title: testPack.pack_name,
        description: testPack.pack_short_description,
        images: testPack.pack_image_url ? [testPack.pack_image_url] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error',
      description: 'An error occurred while loading the test pack.',
    };
  }
}

export default async function Page({ params }) {
  try {
    const testPack = await getTestPackData(params.slug);

    // If no test pack found, show 404
    if (!testPack) {
      notFound();
    }

    return (
      <Suspense fallback={<Loading />}>
        <TestPackPage testPack={testPack} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error in page component:', error);
    throw error;
  }
}
