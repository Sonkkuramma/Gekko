'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useUser, useClerk, useAuth } from '@clerk/nextjs';
import { getUserRoleFromMetadata } from '@/utils/roles';
import AuthDialog from './AuthenticationFlow/AuthDialog';
import {
  ChevronDown,
  Home,
  BarChart2,
  Bell,
  PieChart,
  Heart,
  Wallet,
  LogOut,
  LogIn,
  Moon,
  Sun,
  Laptop,
  GalleryVerticalEnd,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSidebarContext } from './SidebarContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function DropdownWithIconsToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Select value={theme} onValueChange={(value) => setTheme(value)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <div className="flex items-center">
            <Sun className="mr-2 h-4 w-4" />
            Light
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center">
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </div>
        </SelectItem>
        <SelectItem value="system">
          <div className="flex items-center">
            <Laptop className="mr-2 h-4 w-4" />
            System
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export default function Sidenav() {
  const { isOpen } = useSidebarContext();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();
  const [userRole, setUserRole] = useState('user');
  const [satNavOpen, setSatNavOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    if (isLoaded && user) {
      const role = getUserRoleFromMetadata(user.publicMetadata);
      setUserRole(role);
    }
  }, [isLoaded, user]);

  const toggleSatNav = () => setSatNavOpen(!satNavOpen);

  const handleSignOut = () => {
    signOut();
  };

  const handleSignIn = () => {
    setShowAuthDialog(true);
  };

  if (!mounted) {
    return null;
  }

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    {
      icon: BarChart2,
      label: 'User Dashboard',
      href: '/dashboard/user',
      roles: ['user', 'mentor', 'admin'],
    },
    {
      icon: Bell,
      label: 'Mentor Dashboard',
      href: '/dashboard/mentor',
      roles: ['mentor', 'admin'],
    },
    {
      icon: PieChart,
      label: 'Admin Dashboard',
      href: '/dashboard/admin',
      roles: ['admin'],
    },
    { icon: Heart, label: 'Test Packs', href: '/test-packs' },
  ];

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 h-screen bg-background transition-all duration-300 ease-in-out z-[50] m-2 flex flex-col',
          isOpen ? 'w-64' : 'w-16'
        )}
      >
        <header className="flex-shrink-0 flex items-center justify-between h-14 p-2 rounded-sm shadow-md border-2 mb-2">
          <div
            className={cn(
              'flex items-center',
              isOpen ? 'space-x-3' : 'justify-center w-full'
            )}
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-emerald-200 text-emerald-800">
              <GalleryVerticalEnd className="size-4" />
            </div>
            {isOpen && (
              <div>
                <h2 className="font-semibold">GekkoPrep</h2>
                <p className="text-xs text-muted-foreground">
                  Your Practice Evolved
                </p>
              </div>
            )}
          </div>
        </header>

        <div className="flex flex-col h-[calc(100vh-86px)] justify-between p-2 my-1 border shadow-md rounded-sm ">
          <div className="flex-grow overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map(
                (item, index) =>
                  (!item.roles ||
                    (isSignedIn && item.roles.includes(userRole))) && (
                    <li key={index}>
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-start rounded-sm',
                          pathname === item.href &&
                            'bg-emerald-200 text-emerald-800',
                          'hover:bg-emerald-200 hover:text-emerald-800'
                        )}
                        asChild
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4 mr-3" />
                          {isOpen && <span>{item.label}</span>}
                        </Link>
                      </Button>
                    </li>
                  )
              )}
              <li>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start',
                    satNavOpen && 'bg-emerald-200 text-emerald-800',
                    'hover:bg-emerald-200 hover:text-emerald-800'
                  )}
                  onClick={toggleSatNav}
                >
                  <Wallet className="mr-3 h-4 w-4" />
                  {isOpen && (
                    <>
                      <span className="text-sm">SAT Quick Navigation</span>
                      <ChevronDown
                        className={cn(
                          'ml-auto h-4 w-4 transition-transform',
                          satNavOpen && 'rotate-180'
                        )}
                      />
                    </>
                  )}
                </Button>
                {isOpen && satNavOpen && (
                  <ul className="mt-2 space-y-1 pl-6">
                    {['Reading', 'Writing', 'Math'].map((subject) => (
                      <li key={subject}>
                        <Button
                          variant="ghost"
                          className={cn(
                            'w-full justify-start',
                            pathname === `/sat/${subject.toLowerCase()}` &&
                              'bg-emerald-200 text-emerald-800',
                            'hover:bg-emerald-200 hover:text-emerald-800'
                          )}
                          asChild
                        >
                          <Link href={`/sat/${subject.toLowerCase()}`}>
                            {subject}
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </ul>
          </div>

          <div className="flex-shrink-0 p-2 border-t">
            {isSignedIn ? (
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-emerald-200 hover:text-emerald-800"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isOpen && <span>Sign out</span>}
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-emerald-200 hover:text-emerald-800"
                onClick={handleSignIn}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {isOpen && <span>Sign in</span>}
              </Button>
            )}

            {/* {isOpen ? (
              <div className="mt-2">
                <DropdownWithIconsToggle />
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="w-full mt-2 hover:bg-emerald-200 hover:text-emerald-800"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )} */}
          </div>
        </div>
      </nav>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
