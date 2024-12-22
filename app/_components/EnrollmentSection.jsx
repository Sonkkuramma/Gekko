'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Lock, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import AuthDialog from './AuthenticationFlow/AuthDialog';
import Link from 'next/link';

const EnrollmentSection = ({ testPack, bundle }) => {
  const router = useRouter();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const item = testPack || bundle;
  const isBundle = !!bundle;

  const checkEnrollmentStatus = async () => {
    try {
      const response = await fetch('/api/user/testpacks');

      if (response.ok) {
        const data = await response.json();
        let enrolled = false;

        if (isBundle) {
          enrolled = data.testPacks.some((pack) => {
            const belongsToBundle =
              String(pack.bundle_id) === String(item.bundle_id);
            console.log('Bundle enrollment check:', {
              packBundleId: pack.bundle_id,
              currentBundleId: item.bundle_id,
              matches: belongsToBundle,
              packTitle: pack.title,
              bundleName: item.bundle_name,
            });
            return belongsToBundle;
          });

          console.log('Bundle enrollment status:', {
            bundleId: item.bundle_id,
            enrolled,
            testPacksCount: data.testPacks.length,
          });
        } else {
          enrolled = data.testPacks.some((pack) => {
            const matches = String(pack.id) === String(item.pack_id);
            console.log('Test pack enrollment check:', {
              enrolledPackId: pack.id,
              currentPackId: item.pack_id,
              matches,
              packTitle: pack.title,
            });
            return matches;
          });
        }

        console.log('Final enrollment status:', {
          isBundle,
          itemId: isBundle ? item.bundle_id : item.pack_id,
          enrolled,
          itemName: isBundle ? item.bundle_name : item.pack_name,
        });

        setIsEnrolled(enrolled);
      }
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      toast.error('Failed to check enrollment status');
    } finally {
      setIsChecking(false);
    }
  };
  useEffect(() => {
    if (authLoaded && isSignedIn) {
      setShowAuthDialog(false);
      checkEnrollmentStatus();
    } else {
      setIsChecking(false);
    }
  }, [authLoaded, isSignedIn]);

  const handleEnrollment = async () => {
    if (!authLoaded || !isSignedIn) {
      setShowAuthDialog(true);
      return;
    }

    if (!item) {
      toast.error('No item found for enrollment');
      return;
    }

    setIsEnrolling(true);
    try {
      const itemId = isBundle ? item.bundle_id : item.pack_id;

      if (!itemId) {
        console.error('Missing ID:', { item, isBundle });
        throw new Error(`Missing ${isBundle ? 'bundle' : 'test pack'} ID`);
      }

      const enrollmentData = {
        bundleId: isBundle ? itemId : null,
        testPackId: !isBundle ? itemId : null,
        isPremium: Boolean(item.is_premium),
        amountPaid: 0,
      };

      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrollmentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enroll');
      }

      toast.success('Successfully enrolled!');
      setIsEnrolled(true);
      router.refresh();
      router.push('/dashboard/user');
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error(error.message || 'An error occurred during enrollment');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (!item) {
    console.error('No item provided to EnrollmentSection');
    return null;
  }

  return (
    <div className="w-full">
      <Card className="mb-4 rounded-sm">
        <CardHeader>
          <CardTitle>{isBundle ? 'Bundle' : 'Test Pack'} Enrollment</CardTitle>
          <CardDescription>Start your learning journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isChecking ? (
            <Button
              disabled
              className="w-full flex items-center justify-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking enrollment...
            </Button>
          ) : isEnrolled ? (
            <Link href={`/${item.pack_slug || item.slug}`} className="w-full">
              <Button className="w-full flex items-center justify-center">
                Continue Learning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleEnrollment}
              className="w-full flex items-center justify-center gap-2"
              disabled={isEnrolling}
            >
              {isEnrolling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  Enroll in {isBundle ? 'Bundle' : 'Test Pack'}
                  {item.is_premium ? ' (Premium)' : ' (Free)'}
                  {!isSignedIn && <Lock className="h-4 w-4" />}
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
};

export default EnrollmentSection;
