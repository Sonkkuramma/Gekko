'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartConfig = {
  signups: {
    label: 'Total Signups',
    color: 'hsl(var(--chart-1))',
  },
};

const TotalSignupsChart = ({ signupData, trendPercentage }) => {
  // Generate the date range string
  const getDateRangeString = () => {
    if (signupData.length < 2) return 'Last 6 Months';
    const firstMonth = signupData[0].month.split(' ')[0]; // Get only the month name
    const lastMonth = signupData[signupData.length - 1].month.split(' ')[0]; // Get only the month name
    const year = signupData[signupData.length - 1].month.split(' ')[1]; // Get the year from the last month
    return `${firstMonth} - ${lastMonth} ${year}`;
  };

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 border rounded-md w-1/3">
      <CardHeader>
        <CardTitle>Total Signups</CardTitle>
        <CardDescription>{getDateRangeString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={signupData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="signups"
              type="natural"
              stroke="var(--color-signups)"
              strokeWidth={2}
              dot={{
                fill: 'var(--color-signups)',
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending {trendPercentage >= 0 ? 'up' : 'down'} by{' '}
          {Math.abs(trendPercentage)}% this month
          <TrendingUp
            className={`h-4 w-4 ${
              trendPercentage >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total signups for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
};

export default TotalSignupsChart;
