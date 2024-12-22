// TestPacksPage.jsx

import React from 'react';
import TestPackBundleCard from '@/app/_components/testPack/TestPackBundleCard';
import TestPackCard from '@/app/_components/testPack/TestPackCard';
import { getTestPackBundles, getTestPacks } from '@/lib/db';

export default async function TestPacksPage() {
  const testPackBundles = await getTestPackBundles();
  const testPacks = await getTestPacks();

  return (
    <div className="container mx-auto px-4 py-8">
      {testPackBundles.length > 0 && (
        <>
          <h1 className="text-xl font-bold mb-4">Test Pack Bundles</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {testPackBundles.map((bundle) => (
              <TestPackBundleCard key={bundle.bundle_id} bundle={bundle} />
            ))}
          </div>
        </>
      )}

      <h2 className="text-xl font-bold mb-4">Individual Test Packs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testPacks.map((testPack) => (
          <TestPackCard key={testPack.pack_id} testPack={testPack} />
        ))}
      </div>
    </div>
  );
}
