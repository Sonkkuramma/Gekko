'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Users, BookOpen, Award, TrendingUp } from 'lucide-react';
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

const AdminDashboard = () => {
  return (
    <div className="p-2 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
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
            <div className="text-2xl font-bold">42</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+15%</div>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-xs">
        <CardHeader>
          <CardTitle>User Engagement</CardTitle>
          <CardDescription>
            Daily active users are increasing compared to last month.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid auto-rows-min gap-2">
            <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
              856
              <span className="text-sm font-normal text-muted-foreground">
                Active Users/day
              </span>
            </div>
            <ChartContainer
              config={{
                users: {
                  label: 'Users',
                  color: 'hsl(var(--chart-1))',
                },
              }}
              className="aspect-auto h-[32px] w-full"
            >
              <BarChart
                accessibilityLayer
                layout="vertical"
                margin={{
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                }}
                data={[
                  {
                    date: 'This Month',
                    users: 856,
                  },
                ]}
              >
                <Bar
                  dataKey="users"
                  fill="var(--color-users)"
                  radius={4}
                  barSize={32}
                >
                  <LabelList
                    position="insideLeft"
                    dataKey="date"
                    offset={8}
                    fontSize={12}
                    fill="white"
                  />
                </Bar>
                <YAxis dataKey="date" type="category" tickCount={1} hide />
                <XAxis dataKey="users" type="number" hide />
              </BarChart>
            </ChartContainer>
          </div>
          <div className="grid auto-rows-min gap-2">
            <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
              743
              <span className="text-sm font-normal text-muted-foreground">
                Last Month's Average
              </span>
            </div>
            <ChartContainer
              config={{
                users: {
                  label: 'Users',
                  color: 'hsl(var(--muted))',
                },
              }}
              className="aspect-auto h-[32px] w-full"
            >
              <BarChart
                accessibilityLayer
                layout="vertical"
                margin={{
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                }}
                data={[
                  {
                    date: 'Last Month',
                    users: 743,
                  },
                ]}
              >
                <Bar
                  dataKey="users"
                  fill="var(--color-users)"
                  radius={4}
                  barSize={32}
                >
                  <LabelList
                    position="insideLeft"
                    dataKey="date"
                    offset={8}
                    fontSize={12}
                    fill="hsl(var(--muted-foreground))"
                  />
                </Bar>
                <YAxis dataKey="date" type="category" tickCount={1} hide />
                <XAxis dataKey="users" type="number" hide />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
