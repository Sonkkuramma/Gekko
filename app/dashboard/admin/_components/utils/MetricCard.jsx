// app/dashboard/admin/_components/utils/MetricCard.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

export const MetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className = '',
}) => {
  const trendColor =
    trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500';

  return (
    <Card className={`hover:shadow-lg transition-all ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {title}
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>{description}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {trend !== undefined && (
            <div className={`text-sm ${trendColor}`}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
