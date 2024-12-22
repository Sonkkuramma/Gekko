'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useSidebarContext } from './SidebarContext';

const PageContentHolder = ({ children }) => {
  const { isOpen } = useSidebarContext();

  return (
    <div
      className={cn(
        'flex-1 p-4 pt-16 transition-all duration-300 ease-in-out',
        isOpen ? 'md:ml-64' : 'md:ml-16'
      )}
    >
      {children}
    </div>
  );
};

export default PageContentHolder;
