// app/dashboard/admin/_components/AdminDashboard.jsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Menubar, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  DollarSign,
  UserCheck,
  Book,
  Clock,
  BarChart,
  FileText,
  Settings,
  AlertCircle,
  Package,
} from 'lucide-react';
import { MetricCard } from './utils/MetricCard';
import { ChartContainer } from './utils/ChartContainer';
import { DataTable } from './utils/DataTable';
import TotalSignupsCard from './TotalSignupsCard';
import TotalSignupsChart from './TotalSignupsChart';
import UserList from './UserList';
import PackManager from './PackManager';
import UserEnrollments from './UserEnrollments';
import ContentManager from './ContentManager';
import ContentCreator from './ContentCreator';
import IdManagement from './IdManagement';

const AdminDashboard = ({
  initialUsers,
  testPacks,
  bundles,
  onRoleChange,
  onTypeChange,
  onDeleteUser,
  onUpdateUser,
  onEnrollmentChange,
  totalSignups,
  signupData,
  trendPercentage,
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeContentTab, setActiveContentTab] = useState('contentManager');
  const [selectedContentType, setSelectedContentType] = useState('');
  const [dateRange, setDateRange] = useState('30days');

  // Enhanced Memoized Calculations
  const analytics = useMemo(() => {
    const activeUserCount = initialUsers.filter((user) => {
      const lastSeen = new Date(user.last_seen);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastSeen > thirtyDaysAgo;
    }).length;

    const premiumUserCount = initialUsers.filter(
      (user) => user.type === 'premium'
    ).length;

    const totalTestPackEnrollments = initialUsers.reduce(
      (sum, user) => sum + (user.enrolledTestPacks?.length || 0),
      0
    );

    const totalBundleEnrollments = initialUsers.reduce(
      (sum, user) => sum + (user.enrolledBundles?.length || 0),
      0
    );

    const userTypes = initialUsers.reduce((acc, user) => {
      acc[user.type] = (acc[user.type] || 0) + 1;
      return acc;
    }, {});

    return {
      activeUsers: activeUserCount,
      premiumUsers: premiumUserCount,
      premiumPercentage: ((premiumUserCount / totalSignups) * 100).toFixed(1),
      totalEnrollments: totalTestPackEnrollments + totalBundleEnrollments,
      userTypeDistribution: Object.entries(userTypes).map(([type, count]) => ({
        name: type,
        value: count,
      })),
    };
  }, [initialUsers, totalSignups]);

  const courseAnalytics = useMemo(() => {
    const totalPacks = testPacks.length;
    const premiumPacks = testPacks.filter((pack) => pack.is_premium).length;
    const totalBundlesCount = bundles.length;

    return {
      totalCourses: totalPacks + totalBundlesCount,
      premiumPercentage: ((premiumPacks / totalPacks) * 100).toFixed(1),
      bundleCount: totalBundlesCount,
      premiumCount: premiumPacks,
    };
  }, [testPacks, bundles]);

  const renderMetricCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Users"
        value={totalSignups}
        icon={Users}
        trend={parseFloat(trendPercentage)}
        description="Total number of registered users"
      />
      <MetricCard
        title="Active Users"
        value={analytics.activeUsers}
        icon={UserCheck}
        description="Users active in the last 30 days"
      />
      <MetricCard
        title="Premium Users"
        value={`${analytics.premiumPercentage}%`}
        icon={Award}
        description="Percentage of premium subscribers"
      />
      <MetricCard
        title="Total Enrollments"
        value={analytics.totalEnrollments}
        icon={Book}
        description="Total course enrollments"
      />
    </div>
  );

  const renderCourseMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricCard
        title="Total Courses"
        value={courseAnalytics.totalCourses}
        icon={BookOpen}
        description="Total available courses and bundles"
      />
      <MetricCard
        title="Premium Content"
        value={`${courseAnalytics.premiumPercentage}%`}
        icon={Award}
        description="Percentage of premium courses"
      />
      <MetricCard
        title="Active Bundles"
        value={courseAnalytics.bundleCount}
        icon={Package}
        description="Number of active course bundles"
      />
    </div>
  );

  const renderAnalyticsCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <ChartContainer
        title="User Growth"
        description="Monthly user registration trends"
        type="line"
        data={signupData}
        metrics={[
          { key: 'signups', name: 'New Users', color: 'hsl(var(--primary))' },
        ]}
      />
      <ChartContainer
        title="User Distribution"
        description="Distribution by user type"
        type="bar"
        data={analytics.userTypeDistribution}
        metrics={[
          { key: 'value', name: 'Users', color: 'hsl(var(--primary))' },
        ]}
      />
    </div>
  );

  const renderRecentActivity = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest user actions and enrollments</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={initialUsers
            .sort((a, b) => new Date(b.last_seen) - new Date(a.last_seen))
            .slice(0, 5)}
          columns={[
            { key: 'name', label: 'User' },
            { key: 'email', label: 'Email' },
            {
              key: 'last_seen',
              label: 'Last Active',
              render: (row) => new Date(row.last_seen).toLocaleDateString(),
            },
            {
              key: 'type',
              label: 'Type',
              render: (row) => (
                <span
                  className={`capitalize ${
                    row.type === 'premium' ? 'text-primary' : ''
                  }`}
                >
                  {row.type}
                </span>
              ),
            },
          ]}
          pagination={false}
        />
      </CardContent>
    </Card>
  );

  const renderDashboardContent = () => (
    <div className="space-y-6">
      {renderMetricCards()}
      {renderCourseMetrics()}
      {renderAnalyticsCharts()}
      {renderRecentActivity()}
    </div>
  );

  const renderContentReviewTab = () => (
    <div className="space-y-4">
      <Select value={activeContentTab} onValueChange={setActiveContentTab}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select content type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="contentManager">Content Manager</SelectItem>
          <SelectItem value="contentCreator">Content Creator</SelectItem>
        </SelectContent>
      </Select>

      <div className="w-full">
        {activeContentTab === 'contentManager' ? (
          <ContentManager
            selectedContentType={selectedContentType}
            onContentTypeChange={setSelectedContentType}
          />
        ) : (
          <ContentCreator
            selectedContentType={selectedContentType}
            onContentTypeChange={setSelectedContentType}
          />
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent();
      case 'users':
        return (
          <UserList
            initialUsers={initialUsers}
            onRoleChange={onRoleChange}
            onTypeChange={onTypeChange}
            onDeleteUser={onDeleteUser}
            onUpdateUser={onUpdateUser}
          />
        );
      case 'packManager':
        return <PackManager testPacks={testPacks} testPackBundles={bundles} />;
      case 'enrollments':
        return (
          <UserEnrollments
            users={initialUsers}
            testPacks={testPacks}
            bundles={bundles}
            onEnrollmentChange={onEnrollmentChange}
          />
        );
      case 'contentReview':
        return renderContentReviewTab();
      case 'idManagement':
        return <IdManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <Menubar className="mb-6">
        <MenubarMenu>
          <MenubarTrigger
            onClick={() => setActiveTab('dashboard')}
            className={activeTab === 'dashboard' ? 'bg-accent' : ''}
          >
            Dashboard
          </MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger
            onClick={() => setActiveTab('users')}
            className={activeTab === 'users' ? 'bg-accent' : ''}
          >
            Users
          </MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger
            onClick={() => setActiveTab('packManager')}
            className={activeTab === 'packManager' ? 'bg-accent' : ''}
          >
            Pack Manager
          </MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger
            onClick={() => setActiveTab('enrollments')}
            className={activeTab === 'enrollments' ? 'bg-accent' : ''}
          >
            User Enrollments
          </MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger
            onClick={() => setActiveTab('contentReview')}
            className={activeTab === 'contentReview' ? 'bg-accent' : ''}
          >
            Content Review
          </MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger
            onClick={() => setActiveTab('idManagement')}
            className={activeTab === 'idManagement' ? 'bg-accent' : ''}
          >
            ID Management
          </MenubarTrigger>
        </MenubarMenu>
      </Menubar>
      {renderContent()}
    </div>
  );
};

export default AdminDashboard;
