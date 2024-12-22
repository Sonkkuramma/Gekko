'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StepTwo({ testPack, onNext, onBack }) {
  const handleConfirm = () => {
    onNext({ testPackDetails: { id: testPack.id, title: testPack.title } });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{testPack.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{testPack.description}</p>
          <ul className="list-disc list-inside mt-2">
            {testPack.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          <p className="mt-4 font-bold">Price: ${testPack.price}</p>
        </CardContent>
      </Card>
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={handleConfirm}>Confirm and Continue</Button>
      </div>
    </div>
  );
}
