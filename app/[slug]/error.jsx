'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">
        We encountered an error while loading the test pack.
      </p>
      <Button onClick={() => reset()} className="mr-4">
        Try again
      </Button>
      <Button
        variant="outline"
        onClick={() => (window.location.href = '/test-packs')}
      >
        Go to Test Packs
      </Button>
    </div>
  );
}
