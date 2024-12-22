import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const ChartContainer = ({
  title,
  description,
  data,
  type = 'line',
  metrics,
  height = 300,
  className = '',
}) => {
  const Chart = type === 'line' ? LineChart : BarChart;
  const DataComponent = type === 'line' ? Line : Bar;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <Chart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {metrics.map(({ key, color, name }) => (
              <DataComponent
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                fill={color}
                name={name}
              />
            ))}
          </Chart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
