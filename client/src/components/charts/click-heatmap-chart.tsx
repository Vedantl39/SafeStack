import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  clickCount: {
    label: "Clicks",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface HeatmapData {
  id: number;
  page: string;
  elementId: string | null;
  elementType: string | null;
  clickCount: number;
}

function formatHeatmapData(heatmap: HeatmapData[]) {
  if (!heatmap || heatmap.length === 0) return [];
  
  // Group by page and element for more detailed tracking
  const elementData = heatmap.reduce((acc, item) => {
    const key = `${item.page}-${item.elementId || 'page'}`;
    const existing = acc.find(p => p.key === key);
    if (existing) {
      existing.clickCount += item.clickCount;
    } else {
      acc.push({
        key,
        page: item.page,
        elementId: item.elementId,
        elementType: item.elementType,
        clickCount: item.clickCount,
        displayName: item.elementId 
          ? `${item.elementId.replace(/-/g, ' ')} (${item.page.replace(/^\//, '') || 'home'})`
          : item.page.replace(/^\//, '').replace(/-/g, ' ') || 'Home Page'
      });
    }
    return acc;
  }, [] as { key: string; page: string; elementId: string | null; elementType: string | null; clickCount: number; displayName: string }[]);

  return elementData
    .sort((a, b) => b.clickCount - a.clickCount)
    .slice(0, 8);
}

export function ClickHeatmapChart() {
  const { data: heatmap, isLoading } = useQuery({
    queryKey: ['/api/analytics/heatmap'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Click Heatmap</CardTitle>
          <CardDescription>Most clicked areas by you</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!heatmap || !Array.isArray(heatmap) || heatmap.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Click Heatmap</CardTitle>
          <CardDescription>Most clicked areas by you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No click data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = formatHeatmapData(heatmap || []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Click Heatmap</CardTitle>
        <CardDescription>Most clicked areas by you</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} layout="horizontal">
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
                `${value} clicks`,
                chartConfig[name as keyof typeof chartConfig]?.label || name
              ]}
            />
            <Bar dataKey="clickCount" fill="var(--color-clickCount)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}