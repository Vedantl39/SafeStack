import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const chartConfig = {
  accessCount: {
    label: "Access Count",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

interface ResourceData {
  resourceName: string;
  resourceType: string;
  accessCount: number;
}

function formatResourceName(name: string): string {
  return name
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .slice(0, 20);
}

export function ResourceAccessChart() {
  const { data: mostAccessed, isLoading: loadingMostAccessed } = useQuery({
    queryKey: ['/api/analytics/resources/most-accessed'],
  });

  const { data: userAccess, isLoading: loadingUserAccess } = useQuery({
    queryKey: ['/api/analytics/resources/user'],
  });

  if (loadingMostAccessed || loadingUserAccess) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Most Accessed Resources</CardTitle>
            <CardDescription>Popular resources across all users</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Resource Access</CardTitle>
            <CardDescription>Resources you access most frequently</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const mostAccessedData = (mostAccessed || [])
    .slice(0, 6)
    .map((item: ResourceData) => ({
      ...item,
      displayName: formatResourceName(item.resourceName)
    }));

  const userAccessData = (userAccess || [])
    .slice(0, 6)
    .map((item: ResourceData) => ({
      ...item,
      displayName: formatResourceName(item.resourceName)
    }));

  const ResourceChart = ({ data, title, description }: {
    data: any[];
    title: string;
    description: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No resource access data available
          </div>
        ) : (
          <div className="space-y-4">
            <ChartContainer config={chartConfig}>
              <BarChart data={data} layout="horizontal">
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis 
                  dataKey="displayName" 
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={80}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: any, name: string) => [
                    `${value} accesses`,
                    chartConfig[name as keyof typeof chartConfig]?.label || name
                  ]}
                />
                <Bar dataKey="accessCount" fill="var(--color-accessCount)" radius={4} />
              </BarChart>
            </ChartContainer>
            <div className="flex flex-wrap gap-2">
              {data.slice(0, 3).map((item, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {item.resourceType}: {item.accessCount}x
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ResourceChart 
        data={mostAccessedData}
        title="Most Accessed Resources"
        description="Popular resources across all users"
      />
      <ResourceChart 
        data={userAccessData}
        title="Your Resource Access"
        description="Resources you access most frequently"
      />
    </div>
  );
}