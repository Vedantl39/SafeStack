import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModuleUsageChart } from "@/components/charts/module-usage-chart";
import { RiskDistributionChart } from "@/components/charts/risk-distribution-chart";
import { SessionTimeChart } from "@/components/charts/session-time-chart";
import { ClickHeatmapChart } from "@/components/charts/click-heatmap-chart";
import { ResourceAccessChart } from "@/components/charts/resource-access-chart";
import { ModelClassificationDashboard } from "@/components/dashboard/model-classification-dashboard";
import DocumentAnalysisDashboard from "@/components/dashboard/document-analysis-dashboard";
import { VisitorAnalytics } from "@/components/dashboard/visitor-analytics";
import { useClickTracking } from "@/hooks/use-analytics";
import { Puzzle, AlertTriangle, Download, TrendingUp, CheckCircle, Bot, FileText, BarChart2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/auth";

export default function Dashboard() {
  const { user } = useAuth();
  const trackClick = useClickTracking('/dashboard');
  const [activeView, setActiveView] = useState<'models' | 'documents' | 'visitors'>('models');

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard-metrics"],
    queryFn: async () => {
      const token = authApi.getToken();
      const response = await fetch("/api/dashboard-metrics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return response.json();
    },
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["/api/module-usage"],
    queryFn: async () => {
      const token = authApi.getToken();
      const response = await fetch("/api/module-usage", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch activity");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-gray-300">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Header />
      
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-bold text-secondary dark:text-white mb-4">
              Welcome back, {user?.username}
            </h1>
            <p className="text-xl text-slate-600 dark:text-gray-300 max-w-3xl mx-auto">
              Track your progress and monitor key compliance metrics
            </p>
          </div>

          {/* Dashboard Toggle */}
          <div className="mb-8">
            <div className="flex justify-center">
              <div className="flex space-x-2 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <Button
                  variant={activeView === 'models' ? 'default' : 'ghost'}
                  onClick={() => setActiveView('models')}
                  className="flex items-center space-x-2"
                >
                  <Bot className="w-4 h-4" />
                  <span>AI Model Classifications</span>
                </Button>
                <Button
                  variant={activeView === 'documents' ? 'default' : 'ghost'}
                  onClick={() => setActiveView('documents')}
                  className="flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Document Analysis</span>
                </Button>
                <Button
                  variant={activeView === 'visitors' ? 'default' : 'ghost'}
                  onClick={() => setActiveView('visitors')}
                  className="flex items-center space-x-2"
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>Visitor Analytics</span>
                </Button>
              </div>
            </div>
          </div>



          {/* Dashboard Content */}
          {activeView === 'models' && (
            <>
              {/* Charts Row */}
              <div className="grid lg:grid-cols-1 gap-8 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <RiskDistributionChart />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Model Classification Dashboard */}
              <div className="mb-8">
                <ModelClassificationDashboard />
              </div>
            </>
          )}

          {activeView === 'documents' && (
            <div className="mb-8">
              <DocumentAnalysisDashboard />
            </div>
          )}

          {activeView === 'visitors' && (
            <div className="mb-8">
              <VisitorAnalytics />
            </div>
          )}


        </div>
      </main>
      
      <Footer />
    </div>
  );
}
