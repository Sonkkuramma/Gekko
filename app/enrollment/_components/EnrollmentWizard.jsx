'use client';

import { useState } from 'react';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import EnrollmentSummary from './EnrollmentSummary';

const steps = ['User Information', 'Test Pack Details', 'Payment', 'Summary'];

export default function EnrollmentWizard({ testPack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [enrollmentData, setEnrollmentData] = useState({
    userInfo: {},
    testPackDetails: {},
    paymentInfo: {},
  });

  const handleNext = (data) => {
    setEnrollmentData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrollmentData),
      });

      if (response.ok) {
        // Handle successful enrollment
        setCurrentStep(steps.length - 1);
      } else {
        // Handle error
        console.error('Enrollment failed');
      }
    } catch (error) {
      console.error('Error submitting enrollment:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepOne onNext={handleNext} />;
      case 1:
        return (
          <StepTwo
            testPack={testPack}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return <StepThree onNext={handleSubmit} onBack={handleBack} />;
      case 3:
        return <EnrollmentSummary enrollmentData={enrollmentData} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-8">
        {steps.map((step, index) => (
          <span
            key={step}
            className={`px-3 py-1 mr-2 rounded ${
              index === currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {index + 1}. {step}
          </span>
        ))}
      </div>
      {renderStep()}
    </div>
  );
}
