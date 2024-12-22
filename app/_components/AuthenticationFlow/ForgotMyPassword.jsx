'use client';

import React, { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Mail, RefreshCw, Key, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { usePathname } from 'next/navigation';

function ForgotMyPassword({ onBackToSignIn }) {
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState('email'); // 'email', 'otp', or 'password'
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const pathname = usePathname();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isLoaded) {
      console.log('Sign-in not loaded yet');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      if (result.status === 'needs_first_factor') {
        setStep('otp');
        toast.success(
          'Password reset email sent. Please check your inbox for the OTP.'
        );
      } else {
        throw new Error('Unexpected result status');
      }
    } catch (err) {
      console.error('Error during password reset request:', err);
      toast.error(
        err.errors?.[0]?.message ||
          'Password reset request failed. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!isLoaded) {
      console.log('Sign-in not loaded yet');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: otp,
      });

      if (result.status === 'needs_new_password') {
        setStep('password');
        toast.success('OTP verified. Please enter your new password.');
      } else {
        throw new Error('Unexpected result status');
      }
    } catch (err) {
      console.error('Error during OTP verification:', err);
      toast.error(
        err.errors?.[0]?.message || 'OTP verification failed. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please try again.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await signIn.resetPassword({
        password: newPassword,
      });

      if (result.status === 'complete') {
        toast.success('Password reset successful. The page will now reload!');
        setTimeout(() => {
          window.location.href = pathname;
        }, 3000);
      } else {
        throw new Error('Unexpected result status');
      }
    } catch (err) {
      console.error('Error during password reset:', err);
      toast.error(
        err.errors?.[0]?.message || 'Password reset failed. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Reset Your Password</h2>
      {step === 'email' && (
        <>
          <p className="text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              {isProcessing ? 'Sending Reset Email...' : 'Send Reset Email'}
            </Button>
          </form>
        </>
      )}
      {step === 'otp' && (
        <>
          <p className="text-sm text-gray-600">
            Enter the OTP sent to your email.
          </p>
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {isProcessing ? 'Verifying OTP...' : 'Verify OTP'}
            </Button>
          </form>
        </>
      )}
      {step === 'password' && (
        <>
          <p className="text-sm text-gray-600">
            Enter your new password and confirm it.
          </p>
          <form onSubmit={handleSetNewPassword} className="space-y-4">
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Key className="mr-2 h-4 w-4" />
              )}
              {isProcessing ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>
        </>
      )}
      <Button variant="link" onClick={onBackToSignIn} className="w-full">
        Back to Sign In
      </Button>
    </div>
  );
}

export default ForgotMyPassword;
