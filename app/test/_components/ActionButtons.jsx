'use client';

import { useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { SkipForward, ArrowRight, Send } from 'lucide-react';

export function ActionButtons({
  showSkip,
  showNext,
  showSubmit,
  onSkip,
  onNext,
  onSubmit,
  disabled,
  isLastQuestion,
}) {
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [actionType, setActionType] = useState(null);

  const startCooldown = useCallback((type, callback) => {
    // Execute callback immediately
    callback();

    // Start cooldown display
    setActionType(type);
    setCooldown(3);

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setActionType(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSkip = () => {
    if (isLastQuestion) {
      setShowSkipDialog(true);
    } else {
      startCooldown('skip', onSkip);
    }
  };

  const handleNext = () => {
    startCooldown('next', onNext);
  };

  const handleSubmit = () => {
    startCooldown('submit', onSubmit);
  };

  const getButtonText = (type, defaultText) => {
    if (actionType === type && cooldown > 0) {
      switch (type) {
        case 'skip':
          return `Skipping in ( ${cooldown} )`;
        case 'next':
          return `Next in ${cooldown}`;
        case 'submit':
          return `Submitting in ${cooldown}`;
        default:
          return defaultText;
      }
    }
    return defaultText;
  };

  return (
    <>
      <div className="mt-6 flex justify-end gap-4">
        {showSkip && (
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={disabled || cooldown > 0}
            className="gap-2 min-w-[140px]"
          >
            <SkipForward className="h-4 w-4" />
            {getButtonText('skip', 'Skip')}
          </Button>
        )}
        {showNext && (
          <Button
            onClick={handleNext}
            disabled={disabled || cooldown > 0}
            className="gap-2 min-w-[140px]"
          >
            <ArrowRight className="h-4 w-4" />
            {getButtonText('next', 'Next')}
          </Button>
        )}
        {showSubmit && (
          <Button
            onClick={handleSubmit}
            disabled={disabled || cooldown > 0}
            className="gap-2 min-w-[160px]"
          >
            <Send className="h-4 w-4" />
            {getButtonText('submit', 'Submit Test')}
          </Button>
        )}
      </div>

      <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              This is the last question. Skipping will submit your test. Are you
              sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, go back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowSkipDialog(false);
                startCooldown('skip', onSkip);
              }}
            >
              Yes, submit test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
