import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Map, CheckCircle, Clock, Circle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth";

export default function ComplianceRoadmap() {
  const [roadmap, setRoadmap] = useState({
    dataInventory: false,
    riskAssessmentComplete: false,
    documentation: false,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: existingRoadmap } = useQuery({
    queryKey: ["/api/compliance-roadmap"],
    queryFn: async () => {
      const token = authApi.getToken();
      const response = await fetch("/api/compliance-roadmap", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch roadmap");
      return response.json();
    },
  });

  useEffect(() => {
    if (existingRoadmap) {
      setRoadmap({
        dataInventory: existingRoadmap.dataInventory || false,
        riskAssessmentComplete: existingRoadmap.riskAssessmentComplete || false,
        documentation: existingRoadmap.documentation || false,
      });
    }
  }, [existingRoadmap]);

  const saveRoadmapMutation = useMutation({
    mutationFn: async (data: typeof roadmap) => {
      return apiRequest("POST", "/api/compliance-roadmap", data);
    },
    onSuccess: () => {
      toast({
        title: "Progress Saved",
        description: "Your compliance roadmap has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/compliance-roadmap"] });
    },
  });

  const completeModuleMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/module-usage", {
        moduleName: "Compliance Roadmap",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/module-usage"] });
    },
  });

  const handleCheckboxChange = (field: keyof typeof roadmap, checked: boolean) => {
    const newRoadmap = { ...roadmap, [field]: checked };
    setRoadmap(newRoadmap);
    saveRoadmapMutation.mutate(newRoadmap);
  };

  const completedMilestones = Object.values(roadmap).filter(Boolean).length;
  const totalMilestones = Object.keys(roadmap).length;
  const progress = (completedMilestones / totalMilestones) * 100;

  const milestones = [
    {
      key: "dataInventory" as const,
      title: "Data Inventory",
      description: "Complete mapping of all data sources and processing activities",
      deadline: "Month 1",
      status: roadmap.dataInventory ? "completed" : "pending",
      tasks: [
        "Identify all data collection points",
        "Map data flows and processing activities",
        "Document data retention policies",
        "Create data lineage documentation",
      ],
    },
    {
      key: "riskAssessmentComplete" as const,
      title: "Risk Assessment",
      description: "Comprehensive evaluation of AI system risks and mitigation strategies",
      deadline: "Month 2",
      status: roadmap.riskAssessmentComplete ? "completed" : 
               roadmap.dataInventory ? "in_progress" : "pending",
      tasks: [
        "Complete risk assessment questionnaires",
        "Identify high-risk AI systems",
        "Develop risk mitigation strategies",
        "Establish monitoring procedures",
      ],
    },
    {
      key: "documentation" as const,
      title: "Documentation",
      description: "Complete all required compliance documentation and procedures",
      deadline: "Month 3",
      status: roadmap.documentation ? "completed" : 
               roadmap.riskAssessmentComplete ? "in_progress" : "pending",
      tasks: [
        "Create AI system documentation",
        "Develop governance policies",
        "Establish audit procedures",
        "Complete regulatory filing requirements",
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-6 w-6 text-accent" />;
      case "in_progress":
        return <Clock className="h-6 w-6 text-warning" />;
      default:
        return <Circle className="h-6 w-6 text-slate-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-accent text-white";
      case "in_progress":
        return "bg-warning text-white";
      default:
        return "bg-slate-300 text-slate-600";
    }
  };

  const nextMilestone = milestones.find(m => m.status !== "completed");

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-secondary/10 p-4 rounded-lg">
                <Map className="text-secondary h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-secondary mb-4">
              Compliance Roadmap
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Track your AI governance compliance journey with clear milestones and actionable steps.
            </p>
          </div>

          {/* Progress Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Progress</span>
                <span className="text-sm font-normal text-slate-600">
                  {completedMilestones}/{totalMilestones} Milestones Complete
                </span>
              </CardTitle>
              <Progress value={progress} className="w-full" />
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary mb-1">{Math.round(progress)}%</div>
                  <div className="text-sm text-slate-600">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning mb-1">
                    {nextMilestone ? nextMilestone.deadline : "Complete"}
                  </div>
                  <div className="text-sm text-slate-600">Next Deadline</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {totalMilestones - completedMilestones}
                  </div>
                  <div className="text-sm text-slate-600">Remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roadmap Timeline */}
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={milestone.key} className="relative">
                {/* Timeline connector */}
                {index < milestones.length - 1 && (
                  <div className="absolute left-8 top-16 w-0.5 h-24 bg-slate-200"></div>
                )}
                
                <Card className={`border-l-4 ${
                  milestone.status === "completed" ? "border-l-accent" :
                  milestone.status === "in_progress" ? "border-l-warning" : "border-l-slate-300"
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(milestone.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-semibold text-secondary">
                            {milestone.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{milestone.deadline}</Badge>
                            <Badge className={getStatusColor(milestone.status)}>
                              {milestone.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-slate-600 mb-4">{milestone.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-secondary mb-3">Key Tasks</h4>
                            <ul className="space-y-2">
                              {milestone.tasks.map((task, taskIndex) => (
                                <li key={taskIndex} className="flex items-start text-sm text-slate-600">
                                  <span className="text-accent mr-2 mt-1">•</span>
                                  {task}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={milestone.key}
                                checked={roadmap[milestone.key]}
                                onCheckedChange={(checked) => handleCheckboxChange(milestone.key, checked as boolean)}
                              />
                              <Label htmlFor={milestone.key} className="font-medium cursor-pointer">
                                Mark as Complete
                              </Label>
                            </div>
                            {milestone.status === "completed" && (
                              <p className="text-sm text-accent mt-2">
                                ✓ Milestone completed successfully
                              </p>
                            )}
                            {milestone.status === "in_progress" && (
                              <p className="text-sm text-warning mt-2">
                                🔄 Currently in progress
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Next Steps */}
          {nextMilestone && (
            <Card className="mt-8 bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">
                      Focus on: {nextMilestone.title}
                    </h3>
                    <p className="text-slate-600 mb-3">{nextMilestone.description}</p>
                    <p className="text-sm text-primary font-medium">
                      Target completion: {nextMilestone.deadline}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compliance Resources */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Compliance Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-secondary mb-3">Regulatory Guidance</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• GDPR Implementation Guide</li>
                    <li>• EU AI Act Compliance Checklist</li>
                    <li>• FinTech Regulatory Framework</li>
                    <li>• Data Protection Impact Assessment</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary mb-3">Documentation Templates</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• AI System Documentation Template</li>
                    <li>• Risk Assessment Worksheet</li>
                    <li>• Data Processing Record Template</li>
                    <li>• Audit Trail Documentation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary mb-3">Monitoring Tools</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Compliance Dashboard Setup</li>
                    <li>• Automated Monitoring Scripts</li>
                    <li>• Alert Configuration Guide</li>
                    <li>• Reporting Templates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Button 
              onClick={() => completeModuleMutation.mutate()}
              disabled={completeModuleMutation.isPending}
              size="lg"
            >
              {completeModuleMutation.isPending ? "Saving..." : "Mark Module as Complete"}
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
