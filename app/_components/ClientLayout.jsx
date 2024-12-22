'use client';

import React from 'react';
import Header from './Header';
import Sidenav from './Sidenav';
import PageContentHolder from './PageContentHolder';
import { SidebarProvider } from './SidebarContext';

const ClientLayout = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidenav />
        <div className="flex-1 flex flex-col">
          <Header />
          <PageContentHolder>{children}</PageContentHolder>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ClientLayout;
