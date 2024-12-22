import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import EnrollmentWizard from '../_components/EnrollmentWizard';
import { getTestPackById } from '@/lib/api'; // Implement this function to fetch test pack data

export default async function EnrollmentPage({ params }) {
  const testPack = await getTestPackById(params.testPackId);

  if (!testPack) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Enroll in {testPack.title}</h1>
      <Suspense fallback={<div>Loading enrollment wizard...</div>}>
        <EnrollmentWizard testPack={testPack} />
      </Suspense>
    </div>
  );
}
