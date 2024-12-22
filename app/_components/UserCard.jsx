'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const UserCard = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close the card when the pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!user) return null;

  const handleManageAccountClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={cardRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <span className="text-sm font-medium ">
          Welcome,{' '}
          {user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)}!
        </span>
        <Avatar className="h-7 w-7">
          <AvatarImage src={user.imageUrl} alt={user.fullName} />
          <AvatarFallback>
            {user.firstName?.[0]}
            {user.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
      </button>

      {isOpen && (
        <Card className="absolute right-0 mt-5 shadow-lg w-[350px] border-gray-400 rounded-md z-10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-3 text-sm font-medium">
              <Avatar>
                <AvatarImage src={user.imageUrl} alt={user.fullName} />
                <AvatarFallback>
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user.fullName}</p>
                <p className="text-sm text-gray-500">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>

            <div className="flex space-x-2 text-sm font-medium">
              <Button
                asChild
                variant="outline"
                className="flex-1 border border-gray-500"
                onClick={handleManageAccountClick}
              >
                <Link href="/dashboard/user?tab=account">
                  <Settings className="mr-2 h-4 w-4 text-sm" />
                  Manage account
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1 border border-gray-500"
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                }}
              >
                <LogOut className="mr-2 h-4 w-4 text-sm" />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserCard;
