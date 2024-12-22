// app/dashboard/user/_components/UserDashboard.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Activity,
  BookOpen,
  CheckCircle,
  Clock,
  User,
  ArrowRight,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSearchParams, useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const UserDashboard = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const { user } = useUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (
      tabParam &&
      ['dashboard', 'testpacks', 'orders', 'account'].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }

    const fetchEnrolledCourses = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/user/testpacks');
        if (response.ok) {
          const data = await response.json();
          setEnrolledCourses(data.testPacks);
        } else {
          const errorData = await response.json();
          console.error('Failed to fetch enrolled courses:', errorData);
          toast.error(`Failed to load your courses: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        toast.error(
          `An error occurred while loading your courses: ${error.message}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrolledCourses();

    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user, searchParams]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await user.update({
        firstName,
        lastName,
      });
      toast.success('Profile updated successfully', {
        description: 'Your profile information has been saved.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile', {
        description:
          'Please try again. If the problem persists, contact support.',
      });
    }
  };

  const renderTestPackCard = (course) => (
    <Card key={course.id} className="flex flex-col rounded-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{course.title}</CardTitle>
            <CardDescription className="mt-2">
              {course.subtitle}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant={course.is_premium ? 'default' : 'secondary'}>
              {course.is_premium ? 'Premium' : 'Free'}
            </Badge>
            {course.bundle_name && (
              <Badge variant="outline" className="bg-purple-100">
                {course.bundle_name}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          {course.tags.map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          <p>
            Enrolled On: {new Date(course.enrolled_at).toLocaleDateString()}
          </p>
          <p>Status: {course.enrollment_status}</p>
        </div>
      </CardContent>
      <CardContent className="pt-0">
        <Link href={`/${course.test_pack_slug}/details`} className="w-full">
          <Button className="w-full">
            Continue Learning
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  const renderDashboardContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Quizzes Taken
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Study Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32 hours</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrolledCourses.slice(0, 3).map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{course.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Enrolled:{' '}
                    {new Date(course.enrolled_at).toLocaleDateString()}
                  </p>
                </div>
                <Link href={`/${course.test_pack_slug}/details`}>
                  <Button variant="outline" size="sm">
                    Continue
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTestPacksContent = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Test Packs</h2>
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : enrolledCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrolledCourses.map(renderTestPackCard)}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't enrolled in any courses yet.
            </p>
            <Button onClick={() => router.push('/test-packs')}>
              Browse Test Packs
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderOrdersContent = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Orders</h2>
      <p>Your order history will be displayed here.</p>
    </div>
  );

  const renderAccountContent = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Account</h2>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.primaryEmailAddress?.emailAddress || ''}
                disabled
              />
            </div>
            <Button type="submit">Update Profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-2">
      <Toaster />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="testpacks">My Test Packs</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">
          {renderDashboardContent()}
        </TabsContent>
        <TabsContent value="testpacks" className="mt-6">
          {renderTestPacksContent()}
        </TabsContent>
        <TabsContent value="orders" className="mt-6">
          {renderOrdersContent()}
        </TabsContent>
        <TabsContent value="account" className="mt-6">
          {renderAccountContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
