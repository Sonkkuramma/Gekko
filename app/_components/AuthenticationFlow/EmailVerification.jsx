'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSignUp, useSignIn } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';

function EmailVerification({
  emailId,
  password,
  onVerificationComplete,
  onBackToSignIn,
}) {
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const emailSent = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    const sendInitialVerification = async () => {
      if (emailSent.current) return;

      try {
        console.log('Attempting to send initial verification email');
        emailSent.current = true;
        const result = await signUp.prepareEmailAddressVerification({
          strategy: 'email_code',
        });
        console.log('Initial verification email result:', result);
        toast.success('Verification email sent. Please check your inbox.');
      } catch (err) {
        console.error('Error sending initial verification email:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          clerkErrors: err.errors,
        });
        toast.error(
          'Failed to send verification email. You can try resending.'
        );
        emailSent.current = false;
      }
    };

    sendInitialVerification();
  }, [signUp]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      console.log('Attempting verification with code:', otpCode);
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: otpCode,
      });
      console.log('Verification result:', completeSignUp);

      if (completeSignUp.status === 'complete') {
        toast.success('Email verified successfully!');

        toast.info('Your email has been verified. Page will now reload!');
        setTimeout(() => {
          window.location.href = pathname;
        }, 3000);
      } else {
        throw new Error('Verification incomplete');
      }
    } catch (err) {
      console.error('Detailed verification error:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      if (err.errors) {
        console.error('Clerk error details:', err.errors);
      }

      if (err.errors && err.errors.length > 0) {
        const errorCode = err.errors[0].code;
        switch (errorCode) {
          case 'form_code_incorrect':
            toast.error(
              'Invalid verification code. Please check and try again.'
            );
            break;
          case 'form_identifier_not_found':
            toast.error('Email not found. Please check the email address.');
            break;
          case 'form_password_incorrect':
            toast.error('Incorrect password. Please try again.');
            break;
          case 'rate_limit_exceeded':
            toast.error(
              'Too many attempts. Please wait a moment and try again.'
            );
            break;
          case 'session_exists':
            toast.info('This email is already verified. Please sign in.');
            onBackToSignIn();
            break;
          default:
            toast.error(`Verification failed: ${err.errors[0].message}`);
        }
      } else if (err.message === 'Sign-in incomplete') {
        toast.error(
          'Verification successful, but sign-in failed. Please try signing in manually.'
        );
        onBackToSignIn();
      } else if (err.message === 'Verification incomplete') {
        toast.error('Verification process incomplete. Please try again.');
      } else {
        toast.error('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (emailSent.current) {
      toast.info(
        'Verification email was already sent. Please check your inbox or spam folder.'
      );
      return;
    }

    try {
      console.log('Attempting to resend verification email');
      emailSent.current = true;
      const result = await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });
      console.log('Resend verification email result:', result);
      toast.success('New verification code sent. Please check your email.');
    } catch (err) {
      console.error('Error resending verification:', err);
      console.error('Resend error details:', {
        message: err.message,
        stack: err.stack,
        clerkErrors: err.errors,
      });
      toast.error('Failed to send verification code. Please try again.');
      emailSent.current = false;
    }
  };

  return (
    <div className="space-y-4">
      <p>
        We've sent a verification code to {emailId}. Please enter the code
        below:
      </p>
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <Input
          type="text"
          placeholder="Enter verification code"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={isVerifying}>
          {isVerifying ? 'Verifying...' : 'Verify'}
        </Button>
      </form>
      <Button
        onClick={handleResendVerification}
        variant="outline"
        className="w-full"
      >
        Resend Verification Code
      </Button>
      <Button variant="link" onClick={onBackToSignIn}>
        Back to Sign In
      </Button>
    </div>
  );
}

export default EmailVerification;
