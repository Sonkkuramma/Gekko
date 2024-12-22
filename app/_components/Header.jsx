'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import UserCard from './UserCard';
import AuthDialog from './AuthenticationFlow/AuthDialog';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebarContext } from './SidebarContext';
import { Menu } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

function Header() {
  const { isSignedIn, isLoaded } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);
  const searchParams = useSearchParams();
  const { isOpen, setIsOpen } = useSidebarContext();

  useEffect(() => {
    if (searchParams.get('openAuth') === 'true') {
      setShowAuthDialog(true);
    }
  }, [searchParams]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <header
      className={cn(
        'bg-white fixed top-0 z-50 shadow-md h-14 transition-all duration-300 ease-in-out border rounded-md mx-5 my-2',
        isOpen ? 'left-64 w-[calc(100%-18rem)]' : 'left-16 w-[calc(100%-6rem)]'
      )}
    >
      <div className="mx-auto flex h-full items-center px-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover:bg-emerald-200"
          >
            <Menu className={cn('h-4 w-4', !isOpen)} />
          </Button>
          <Separator orientation="vertical" className="h-4" />
        </div>
        {/* <Image src="/logo.svg" width={120} height={80} alt="logo" /> */}
        <div className="ml-auto">
          {isLoaded && isSignedIn ? (
            <UserCard />
          ) : (
            <Button onClick={() => setShowAuthDialog(true)}>Sign In</Button>
          )}
        </div>
      </div>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </header>
  );
}

export default Header;
