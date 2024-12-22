import React from 'react';
import UserDashboard from './_components/UserDashboard';
import TestDashboard from './_components/TestDashboard';

export default function UserDashboardPage() {
  return (
    <div className="container mx-auto">
      <UserDashboard />
      <TestDashboard />
    </div>
  );
}
