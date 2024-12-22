'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  BarChart as RechartsBarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const [metricsResponse, trendsResponse] = await Promise.all([
        fetch(`/api/analytics/metrics?timeframe=${timeframe}`),
        fetch(`/api/analytics/trends?timeframe=${timeframe}`),
      ]);

      if (!metricsResponse.ok || !trendsResponse.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const [metricsData, trendsData] = await Promise.all([
        metricsResponse.json(),
        trendsResponse.json(),
      ]);

      setMetrics(metricsData);
      setTrends(trendsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function downloadReport() {
    try {
      const response = await fetch(
        `/api/analytics/report?timeframe=${timeframe}`
      );
      if (!response.ok) throw new Error('Failed to download report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${timeframe}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download report:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  const metricCards = [
    {
      title: 'Total Revenue',
      value: `₹${metrics?.revenue.toLocaleString()}`,
      change: metrics?.revenueChange,
      trend: metrics?.revenueChange >= 0 ? 'up' : 'down',
    },
    {
      title: 'Active Users',
      value: metrics?.activeUsers.toLocaleString(),
      change: metrics?.userChange,
      trend: metrics?.userChange >= 0 ? 'up' : 'down',
    },
    {
      title: 'Enrollments',
      value: metrics?.enrollments.toLocaleString(),
      change: metrics?.enrollmentChange,
      trend: metrics?.enrollmentChange >= 0 ? 'up' : 'down',
    },
    {
      title: 'Completion Rate',
      value: `${metrics?.completionRate}%`,
      change: metrics?.completionRateChange,
      trend: metrics?.completionRateChange >= 0 ? 'up' : 'down',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={downloadReport}>
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p
                className={`text-xs ${
                  metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {metric.change >= 0 ? '+' : ''}
                {metric.change}% from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends?.revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `₹${value}`}
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString()
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={trends?.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString()
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="activeUsers"
                    name="Active Users"
                    fill="#10b981"
                  />
                  <Bar dataKey="newUsers" name="New Users" fill="#3b82f6" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Test Pack Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Test Pack Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={trends?.testPackPerformance}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar
                    dataKey="enrollments"
                    name="Enrollments"
                    fill="#10b981"
                  />
                  <Bar
                    dataKey="completions"
                    name="Completions"
                    fill="#3b82f6"
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends?.enrollments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString()
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Enrollments"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
