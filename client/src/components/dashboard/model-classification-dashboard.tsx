import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle, XCircle, Shield, FileText, Building2, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { EditRiskLevelModal } from "@/components/modals/edit-risk-level-modal";

interface AiModelClassification {
  id: number;
  modelName: string;
  department: string;
  modelOwner: string;
  purpose: string;
  useCaseType: string;
  inputData: string;
  riskTier: string;
  aiActStatus: string;
  legalNotes: string;
  detectedRisks: string[];
  createdAt: string;
  updatedAt: string;
}

interface ClassificationStat {
  aiActStatus: string;
  count: number;
}

interface DepartmentData {
  department: string;
  classifications: AiModelClassification[];
}

const RISK_COLOR_MAP = {
  "High-Risk": "#ef4444",     // red-500
  "Medium-Risk": "#eab308",   // yellow-500
  "Low-Risk": "#22c55e",      // green-500
  "Prohibited": "#991b1b",    // red-800
  "Unregulated": "#6b7280"    // gray-500
};

const RISK_TEXT_COLOR_MAP = {
  "High-Risk": "text-red-700 dark:text-red-300",
  "Medium-Risk": "text-yellow-700 dark:text-yellow-300",
  "Low-Risk": "text-green-700 dark:text-green-300",
  "Prohibited": "text-red-900 dark:text-red-200",
  "Unregulated": "text-gray-700 dark:text-gray-300"
};

export function ModelClassificationDashboard() {
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());
  const [isDepartmentSectionExpanded, setIsDepartmentSectionExpanded] = useState(true);
  const [isAlertCenterExpanded, setIsAlertCenterExpanded] = useState(true);
  
  const { data: classifications, isLoading: classificationsLoading } = useQuery({
    queryKey: ["/api/ai-model-classifications"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/ai-model-classifications/stats"],
  });

  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ["/api/ai-model-classifications/departments"],
  });

  const isLoading = classificationsLoading || statsLoading || departmentsLoading;

  const toggleDepartment = (department: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(department)) {
      newExpanded.delete(department);
    } else {
      newExpanded.add(department);
    }
    setExpandedDepartments(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const classificationData = classifications as AiModelClassification[] || [];
  const statsData = stats as ClassificationStat[] || [];
  const departmentData = departments as DepartmentData[] || [];

  // Prepare data for bar chart
  const riskTierData = statsData.map(stat => ({
    name: stat.aiActStatus,
    count: stat.count,
    color: RISK_COLOR_MAP[stat.aiActStatus as keyof typeof RISK_COLOR_MAP]
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const riskCategory = label;
      const modelsInCategory = classificationData.filter(model => model.aiActStatus === riskCategory);
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-w-sm">
          <p className="text-gray-900 dark:text-white font-medium mb-2">{riskCategory}</p>
          <p className="text-primary mb-2">
            Count: <span className="font-semibold">{payload[0].value}</span>
          </p>
          {modelsInCategory.length > 0 && (
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-sm mb-1">Models:</p>
              <div className="max-h-32 overflow-y-auto">
                {modelsInCategory.slice(0, 8).map((model, index) => (
                  <p key={model.id} className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    • {model.modelName}
                  </p>
                ))}
                {modelsInCategory.length > 8 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                    ...and {modelsInCategory.length - 8} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate totals
  const totalModels = classificationData.length;
  const highRiskCount = statsData.find(s => s.aiActStatus === "High-Risk")?.count || 0;
  const prohibitedCount = statsData.find(s => s.aiActStatus === "Prohibited")?.count || 0;
  const alertCount = highRiskCount + prohibitedCount;

  // Sort stats for display
  const sortedStats = [...statsData].sort((a, b) => {
    const order = ["Prohibited", "High-Risk", "Medium-Risk", "Low-Risk", "Unregulated"];
    return order.indexOf(a.aiActStatus) - order.indexOf(b.aiActStatus);
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          AI Risk Compliance Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Monitor your AI model inventory and compliance status
        </p>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Models</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalModels}</div>
              <p className="text-xs text-muted-foreground">
                AI models classified
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{highRiskCount}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prohibited</CardTitle>
              <XCircle className="h-4 w-4 text-red-800" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800 dark:text-red-300">{prohibitedCount}</div>
              <p className="text-xs text-muted-foreground">
                Not permitted
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departmentData.length}</div>
              <p className="text-xs text-muted-foreground">
                Using AI models
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Risk Tier Distribution Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Risk Tier Distribution</CardTitle>
            <CardDescription>
              AI models classified by EU AI Act risk categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskTierData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
                    radius={[4, 4, 0, 0]}
                  >
                    {riskTierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Departmental Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-muted/30 -m-6 p-6 rounded-lg transition-colors"
              onClick={() => setIsDepartmentSectionExpanded(!isDepartmentSectionExpanded)}
            >
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Models by Department</span>
                  <div className="transition-transform duration-200">
                    {isDepartmentSectionExpanded ? (
                      <ChevronDown className="h-5 w-5 text-primary" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardTitle>
                <CardDescription className="mt-1">
                  AI model distribution across organizational departments
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {departmentData.length} department{departmentData.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          
          <AnimatePresence>
            {isDepartmentSectionExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <CardContent className="pt-0">
            <div className="space-y-2">
              {departmentData.map((dept, index) => {
                const departmentName = dept.department || 'Unknown Department';
                const isExpanded = expandedDepartments.has(departmentName);
                
                return (
                  <div key={dept.department} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleDepartment(departmentName)}
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors bg-white dark:bg-gray-950 border-b last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="transition-transform duration-200">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-primary" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white text-left">
                          {departmentName}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {dept.classifications.length} model{dept.classifications.length !== 1 ? 's' : ''}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {isExpanded ? 'Click to collapse' : 'Click to expand'}
                        </span>
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden border-t bg-muted/30"
                        >
                          <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {dept.classifications.map((model, modelIndex) => (
                                <motion.div
                                  key={model.id}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: modelIndex * 0.05, duration: 0.2 }}
                                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-md border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 relative group"
                                  title={`${model.modelName} - ${model.aiActStatus}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white block truncate">
                                      {model.modelName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {model.modelOwner}
                                    </span>
                                  </div>
                                  <Badge 
                                    variant="outline" 
                                    className={`ml-3 text-xs ${RISK_TEXT_COLOR_MAP[model.aiActStatus as keyof typeof RISK_TEXT_COLOR_MAP]}`}
                                  >
                                    {model.aiActStatus}
                                  </Badge>
                                  
                                  {/* Hover tooltip for high-risk models */}
                                  {model.aiActStatus === "High-Risk" && (
                                    <div className="absolute left-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                      <div className="text-sm">
                                        <p className="font-medium text-gray-900 dark:text-white mb-1">
                                          Why High-Risk?
                                        </p>
                                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                                          {model.purpose}
                                        </p>
                                        {model.detectedRisks.length > 0 && (
                                          <div>
                                            <p className="font-medium text-red-600 dark:text-red-400 mb-1">
                                              Detected Risks:
                                            </p>
                                            <ul className="text-red-700 dark:text-red-300 text-xs space-y-1">
                                              {model.detectedRisks.map((risk, idx) => (
                                                <li key={idx}>• {risk}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                            
                            {dept.classifications.length === 0 && (
                              <div className="text-center py-6 text-muted-foreground">
                                <FileText className="h-8 w-8 mx-auto mb-2" />
                                <p>No models found in this department</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Alert Center */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-muted/30 -m-6 p-6 rounded-lg transition-colors"
              onClick={() => setIsAlertCenterExpanded(!isAlertCenterExpanded)}
            >
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Alert Center</span>
                  <div className="transition-transform duration-200">
                    {isAlertCenterExpanded ? (
                      <ChevronDown className="h-5 w-5 text-primary" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardTitle>
                <CardDescription className="mt-1">
                  Models requiring immediate attention
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {alertCount > 0 && (
                  <Badge className="text-xs bg-blue-500 hover:bg-blue-600 text-white">
                    {alertCount} alert{alertCount !== 1 ? 's' : ''}
                  </Badge>
                )}
                {alertCount === 0 && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                    No alerts
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <AnimatePresence>
            {isAlertCenterExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <CardContent className="pt-0">
            {alertCount > 0 ? (
              <div className="space-y-3">
                {classificationData
                  .filter(model => model.aiActStatus === "High-Risk" || model.aiActStatus === "Prohibited")
                  .map((model) => (
                    <Alert key={model.id} className="border-red-200 dark:border-red-800">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription>
                        <strong>{model.modelName}</strong> in <strong>{model.department || 'Unknown'}</strong> department
                        is flagged as <strong>{model.aiActStatus}</strong>
                        {model.detectedRisks.length > 0 && (
                          <span className="block mt-1 text-sm">
                            Detected risks: {model.detectedRisks.join(', ')}
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-green-600 dark:text-green-400 font-medium">
                  ✅ No high-risk or prohibited models currently flagged
                </p>
              </div>
            )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Recent Classifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Classifications</CardTitle>
            <CardDescription>
              Latest AI model classifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {classificationData.slice(0, 5).map((model) => (
                <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{model.modelName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{model.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={RISK_TEXT_COLOR_MAP[model.aiActStatus as keyof typeof RISK_TEXT_COLOR_MAP]}
                    >
                      {model.aiActStatus}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(model.createdAt).toLocaleDateString()}
                    </span>
                    <EditRiskLevelModal model={model} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}