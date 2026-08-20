import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const chartConfig = {
  duration: {
    label: "Session Time",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface SessionData {
  id: number;
  startTime: string;
  endTime: string | null;
  duration: number | null;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function formatSessionData(sessions: SessionData[], filter: string) {
  const now = new Date();
  const filtered = sessions.filter(session => {
    if (!session.duration) return false;
    
    const sessionDate = new Date(session.startTime);
    
    switch (filter) {
      case 'day':
        return sessionDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sessionDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return sessionDate >= monthAgo;
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return sessionDate >= yearAgo;
      default:
        return true;
    }
  });

  // Group sessions by time period based on filter
  const grouped: { [key: string]: { duration: number; count: number; dates: Date[] } } = {};
  
  filtered.forEach(session => {
    const sessionDate = new Date(session.startTime);
    let groupKey: string;
    
    switch (filter) {
      case 'day':
        // Group by hour for day view
        groupKey = sessionDate.toLocaleTimeString([], { hour: '2-digit', hour12: false }) + ':00';
        break;
      case 'week':
        // Group by day for week view
        groupKey = sessionDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
        break;
      case 'month':
        // Group by month for month view
        groupKey = sessionDate.toLocaleDateString([], { month: 'short', year: 'numeric' });
        break;
      case 'year':
        // Group by month for year view
        groupKey = sessionDate.toLocaleDateString([], { month: 'short', year: 'numeric' });
        break;
      default:
        // Group by month for all time
        groupKey = sessionDate.toLocaleDateString([], { month: 'short', year: 'numeric' });
        break;
    }
    
    if (!grouped[groupKey]) {
      grouped[groupKey] = { duration: 0, count: 0, dates: [] };
    }
    
    grouped[groupKey].duration += session.duration || 0;
    grouped[groupKey].count += 1;
    grouped[groupKey].dates.push(sessionDate);
  });

  // Convert grouped data to chart format
  const chartData = Object.entries(grouped)
    .map(([period, data]) => ({
      session: period,
      duration: data.duration,
      durationFormatted: formatDuration(data.duration),
      sessionCount: data.count,
      fullDate: data.dates[0].toLocaleDateString(),
      time: data.dates[0].toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))
    .sort((a, b) => {
      // Sort by the first date in each group
      return new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime();
    })
    .slice(-10); // Show last 10 periods

  return chartData;
}

export function SessionTimeChart() {
  const [timeFilter, setTimeFilter] = useState('week');
  
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['/api/sessions'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Duration</CardTitle>
          <CardDescription>Your recent session times on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Duration</CardTitle>
          <CardDescription>Your recent session times on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No session data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = formatSessionData(sessions, timeFilter);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Session Duration</CardTitle>
            <CardDescription>Your recent session times on the platform</CardDescription>
          </div>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="session"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tickFormatter={formatDuration}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: any, name: string, props: any) => [
                formatDuration(value),
                chartConfig[name as keyof typeof chartConfig]?.label || name
              ]}
              labelFormatter={(label: string, payload: any) => {
                if (payload && payload[0]?.payload) {
                  const data = payload[0].payload;
                  return `${label} - ${data.sessionCount} session${data.sessionCount > 1 ? 's' : ''}`;
                }
                return label;
              }}
            />
            <Bar dataKey="duration" fill="var(--color-duration)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}