import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { FileText, AlertTriangle, Shield, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DocumentAnalysis {
  id: number;
  fileName: string;
  fileType: string;
  overallRisk: 'High' | 'Medium' | 'Low' | 'None';
  detections: Array<{
    chunk: string;
    risk_category: string;
    explanation: string;
  }>;
  createdAt: string;
  userId: number;
}

interface DocumentAnalysisStats {
  overallRisk: 'High' | 'Medium' | 'Low' | 'None';
  count: number;
}

const RISK_COLOR_MAP = {
  "High": "#ef4444",    // red-500
  "Medium": "#f59e0b",  // amber-500
  "Low": "#10b981",     // emerald-500
  "None": "#6b7280"     // gray-500
};

const RISK_TEXT_COLOR_MAP = {
  "High": "text-red-700 dark:text-red-300",
  "Medium": "text-amber-700 dark:text-amber-300",
  "Low": "text-emerald-700 dark:text-emerald-300",
  "None": "text-gray-700 dark:text-gray-300"
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'Low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'None': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

const getRiskIcon = (risk: string) => {
  switch (risk) {
    case 'High': return <XCircle className="w-4 h-4" />;
    case 'Medium': return <AlertTriangle className="w-4 h-4" />;
    case 'Low': return <Shield className="w-4 h-4" />;
    case 'None': return <CheckCircle className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

export default function DocumentAnalysisDashboard() {
  const [expandedAnalysis, setExpandedAnalysis] = useState<number | null>(null);
  
  const { data: analyses = [], isLoading: analysesLoading } = useQuery<DocumentAnalysis[]>({
    queryKey: ['/api/document-analyses'],
  });

  const { data: stats = [], isLoading: statsLoading } = useQuery<DocumentAnalysisStats[]>({
    queryKey: ['/api/document-analyses/stats'],
  });

  const isLoading = analysesLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const analysesData = analyses as DocumentAnalysis[] || [];
  const statsData = stats as DocumentAnalysisStats[] || [];

  // Prepare data for pie chart
  const riskDistributionData = statsData.map(stat => ({
    name: stat.overallRisk,
    value: stat.count,
    color: RISK_COLOR_MAP[stat.overallRisk as keyof typeof RISK_COLOR_MAP]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-gray-900 dark:text-white font-medium">{payload[0].name}</p>
          <p className="text-primary">
            Count: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate totals
  const totalDocuments = analysesData.length;
  const highRiskCount = statsData.find(s => s.overallRisk === "High")?.count || 0;
  const mediumRiskCount = statsData.find(s => s.overallRisk === "Medium")?.count || 0;
  const lowRiskCount = statsData.find(s => s.overallRisk === "Low")?.count || 0;
  const noRiskCount = statsData.find(s => s.overallRisk === "None")?.count || 0;
  const alertCount = highRiskCount;

  if (totalDocuments === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Total Documents", value: "0", icon: FileText },
            { title: "High Risk", value: "0", icon: XCircle },
            { title: "Low/No Risk", value: "0", icon: CheckCircle },
            { title: "Alerts", value: "0", icon: AlertTriangle }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>No documents have been analyzed yet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No documents analyzed
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Upload your first document to start analyzing compliance risks and detecting sensitive data usage.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Documents", value: totalDocuments.toString(), icon: FileText },
          { title: "High Risk", value: highRiskCount.toString(), icon: XCircle },
          { title: "Low/No Risk", value: (lowRiskCount + noRiskCount).toString(), icon: CheckCircle },
          { title: "Alerts", value: alertCount.toString(), icon: AlertTriangle }
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Alert for High-Risk Documents */}
      {alertCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              You have {alertCount} high-risk document{alertCount > 1 ? 's' : ''} that require immediate attention for EU AI Act compliance.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>Document risk levels across your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color }} className="text-sm font-medium">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Document Analyses */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Analyses</CardTitle>
              <CardDescription>Latest document uploads and risk assessments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysesData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p>No documents analyzed yet</p>
                </div>
              ) : (
                analysesData.slice(0, 5).map((analysis) => (
                  <div key={analysis.id}>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        {getRiskIcon(analysis.overallRisk)}
                        <div>
                          <p className="font-medium text-sm">{analysis.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(analysis.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={`${getRiskColor(analysis.overallRisk)} text-xs`}
                        >
                          {analysis.overallRisk} Risk
                        </Badge>
                        {analysis.detections.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedAnalysis(
                              expandedAnalysis === analysis.id ? null : analysis.id
                            )}
                            className="text-xs h-6 px-2"
                          >
                            {analysis.detections.length} detection{analysis.detections.length > 1 ? 's' : ''}
                            {expandedAnalysis === analysis.id ? (
                              <ChevronUp className="w-3 h-3 ml-1" />
                            ) : (
                              <ChevronDown className="w-3 h-3 ml-1" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Expanded Detection Details */}
                    <AnimatePresence>
                      {expandedAnalysis === analysis.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-2 p-3 bg-muted/30 border rounded-lg"
                        >
                          <h4 className="font-medium text-sm mb-3 text-muted-foreground">
                            Detection Details
                          </h4>
                          <div className="space-y-3">
                            {analysis.detections.map((detection, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-3 bg-background border rounded-md"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <Badge 
                                    variant="secondary" 
                                    className="text-xs"
                                  >
                                    {detection.risk_category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  <strong>Content:</strong> {detection.chunk}
                                </p>
                                <p className="text-sm">
                                  <strong>Issue:</strong> {detection.explanation}
                                </p>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}