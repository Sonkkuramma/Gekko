'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Error({ error, reset }) {
  const router = useRouter();

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-2">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <div className="flex gap-2">
        <Button onClick={() => reset()}>Try again</Button>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/admin')}
        >
          Go back
        </Button>
      </div>
    </div>
  );
}
