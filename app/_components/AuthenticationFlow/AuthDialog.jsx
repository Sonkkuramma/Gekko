'use client';

import React, { useState } from 'react';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Facebook, Mail, User, RefreshCw, Eye, EyeOff } from 'lucide-react';
import EmailVerification from './EmailVerification';
import ForgotPassword from './ForgotMyPassword';
import { usePathname } from 'next/navigation';

function AuthDialog({ open, onOpenChange }) {
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [createdSessionId, setCreatedSessionId] = useState(null);
  const pathname = usePathname();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (!isSignInLoaded || !isSignUpLoaded) {
      console.log('Sign-in or Sign-up not loaded yet');
      return;
    }

    try {
      if (isSignUp) {
        setIsVerifying(true);
        console.log('Attempting to create user with:', {
          firstName,
          lastName,
          emailId,
        });
        const result = await signUp.create({
          firstName,
          lastName,
          emailAddress: emailId,
          password,
        });
        console.log('Sign-up result:', result);

        setIsVerifying(false);

        if (result.status === 'complete') {
          toast.success('Account created and signed in successfully!');
          window.location.href = pathname;
        } else if (result.status === 'missing_requirements') {
          console.log(
            'Verification required, session ID:',
            result.createdSessionId
          );
          setCreatedSessionId(result.createdSessionId);
          setPendingVerification(true);
          toast.info('Please check your email for the verification code.');
        } else {
          console.log('Unexpected sign-up status:', result.status);
          setError('Sign-up failed. Please try again.');
        }
      } else {
        const result = await signIn.create({
          identifier: emailId,
          password,
        });
        if (result.status === 'complete') {
          onOpenChange(false);
          toast.success('Signed in successfully!');
          window.location.href = pathname;
        } else {
          setError('Sign-in failed. Please try again.');
        }
      }
    } catch (err) {
      console.error(`Error during ${isSignUp ? 'sign-up' : 'sign-in'}:`, err);
      setError(
        `${isSignUp ? 'Sign-up' : 'Sign-in'} failed. ${
          err.errors?.[0]?.message || 'Please try again.'
        }`
      );
    }
  };

  const handleSocialAuth = async (strategy) => {
    try {
      const signInOrUp = isSignUp ? signUp : signIn;
      await signInOrUp.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: pathname,
      });
    } catch (err) {
      console.error('Error during social auth:', err);
      setError('Social authentication failed. Please try again.');
    }
  };

  const handleVerificationComplete = () => {
    window.location.href = pathname;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (pendingVerification) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
          </DialogHeader>
          <EmailVerification
            emailId={emailId}
            password={password}
            createdSessionId={createdSessionId}
            onVerificationComplete={handleVerificationComplete}
            onBackToSignIn={() => {
              setPendingVerification(false);
              setIsSignUp(false);
            }}
          />
        </DialogContent>
      </Dialog>
    );
  }

  if (isForgotPassword) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
          </DialogHeader>
          <ForgotPassword onBackToSignIn={() => setIsForgotPassword(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isSignUp ? 'Sign Up' : 'Sign In'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            onClick={() => handleSocialAuth('oauth_google')}
            className="w-full"
          >
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            {isSignUp ? 'Sign up' : 'Sign in'} with Google
          </Button>
          <Button
            onClick={() => handleSocialAuth('oauth_facebook')}
            className="w-full"
          >
            <Facebook className="mr-2 h-4 w-4" />
            {isSignUp ? 'Sign up' : 'Sign in'} with Facebook
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <>
                <Input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </>
            )}
            <Input
              type="email"
              placeholder="Email ID"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              required
              autoComplete="username"
            />
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={isVerifying}>
              {isVerifying ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : isSignUp ? (
                <User className="mr-2 h-4 w-4" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              {isSignUp ? 'Sign up' : 'Sign in'} with Email
            </Button>
          </form>
          {!isSignUp && (
            <Button
              variant="link"
              onClick={() => setIsForgotPassword(true)}
              className="w-full"
            >
              Forgot Password?
            </Button>
          )}
          <p className="text-center text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Button
              variant="link"
              className="p-0"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuthDialog;
