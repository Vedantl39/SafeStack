import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/auth";
import { Users, Activity, TrendingUp, CalendarDays } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface VisitorStats {
  totalUsers: number;
  totalSessions: number;
  activeUsersLast7Days: number;
  activeUsersLast30Days: number;
  chartData: { label: string; sessions: number }[];
}

type Period = 7 | 30 | 90 | "all";

const PERIODS: { label: string; value: Period }[] = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
  { label: "All Time", value: "all" },
];

function chartTitle(period: Period) {
  if (period === "all") return "Monthly Sessions — All Time";
  return `Daily Sessions — Last ${period} Days`;
}

export function VisitorAnalytics() {
  const [period, setPeriod] = useState<Period>("all");

  const queryParam = period === "all" ? "all" : String(period);

  const { data, isLoading } = useQuery<VisitorStats>({
    queryKey: ["/api/analytics/visitors", queryParam],
    queryFn: async () => {
      const token = authApi.getToken();
      const res = await fetch(`/api/analytics/visitors?days=${queryParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch visitor stats");
      return res.json();
    },
  });

  const stats = [
    {
      label: "Total Registered Users",
      value: data?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Total Sessions (All Time)",
      value: data?.totalSessions ?? 0,
      icon: Activity,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: "Active Users (Last 7 Days)",
      value: data?.activeUsersLast7Days ?? 0,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Active Users (Last 30 Days)",
      value: data?.activeUsersLast30Days ?? 0,
      icon: CalendarDays,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border border-gray-200 dark:border-gray-700">
              <CardContent className="p-5">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    {isLoading ? (
                      <div className="h-6 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                    ) : (
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-gray-400 leading-tight">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base font-semibold text-secondary dark:text-white">
              {chartTitle(period)}
            </CardTitle>
            <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg self-start">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    period === p.value
                      ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                      : "text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-56 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : !data?.chartData?.length ? (
            <div className="h-56 flex items-center justify-center text-slate-400 dark:text-gray-500 text-sm">
              No session data yet. Visitor activity will appear here once users log in.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.chartData}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval={data.chartData.length > 20 ? Math.floor(data.chartData.length / 10) : 0}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [value, "Sessions"]}
                  />
                  <Bar
                    dataKey="sessions"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
