import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth";

export default function Explainability() {
  const [plan, setPlan] = useState({
    systemOwner: "",
    auditResponsibility: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: existingPlan } = useQuery({
    queryKey: ["/api/explainability-plan"],
    queryFn: async () => {
      const token = authApi.getToken();
      const response = await fetch("/api/explainability-plan", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch plan");
      return response.json();
    },
  });

  useEffect(() => {
    if (existingPlan) {
      setPlan({
        systemOwner: existingPlan.systemOwner || "",
        auditResponsibility: existingPlan.auditResponsibility || "",
      });
    }
  }, [existingPlan]);

  const savePlanMutation = useMutation({
    mutationFn: async (data: typeof plan) => {
      return apiRequest("POST", "/api/explainability-plan", data);
    },
    onSuccess: () => {
      toast({
        title: "Plan Saved",
        description: "Your explainability plan has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/explainability-plan"] });
    },
  });

  const completeModuleMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/module-usage", {
        moduleName: "Explainability & Oversight Planner",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/module-usage"] });
    },
  });

  const handleSave = () => {
    savePlanMutation.mutate(plan);
  };

  const handleComplete = () => {
    if (plan.systemOwner && plan.auditResponsibility) {
      savePlanMutation.mutate(plan);
      completeModuleMutation.mutate();
    } else {
      toast({
        title: "Incomplete Plan",
        description: "Please fill in all required fields before completing the module.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <Eye className="text-primary h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-secondary mb-4">
              Explainability & Oversight Planner
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Plan and assign roles for AI system explainability and oversight responsibilities.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Role Assignments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="systemOwner" className="text-base font-medium">
                  AI System Owner *
                </Label>
                <Input
                  id="systemOwner"
                  type="text"
                  value={plan.systemOwner}
                  onChange={(e) => setPlan({ ...plan, systemOwner: e.target.value })}
                  placeholder="Enter name or role"
                  className="mt-2"
                />
                <p className="text-sm text-slate-600 mt-1">
                  Person or role responsible for overall AI system governance
                </p>
              </div>
              
              <div>
                <Label htmlFor="auditResponsibility" className="text-base font-medium">
                  Audit Responsibility *
                </Label>
                <Select
                  value={plan.auditResponsibility}
                  onValueChange={(value) => setPlan({ ...plan, auditResponsibility: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select audit responsibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Data Science Team">Data Science Team</SelectItem>
                    <SelectItem value="Compliance Officer">Compliance Officer</SelectItem>
                    <SelectItem value="External Auditor">External Auditor</SelectItem>
                    <SelectItem value="Risk Management">Risk Management</SelectItem>
                    <SelectItem value="Legal Team">Legal Team</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-600 mt-1">
                  Team or individual responsible for auditing AI system decisions
                </p>
              </div>
              
              <Button onClick={handleSave} disabled={savePlanMutation.isPending}>
                {savePlanMutation.isPending ? "Saving..." : "Save Assignments"}
              </Button>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Explainability Framework</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-secondary mb-3">Technical Explainability</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Model-agnostic explanation methods</li>
                    <li>• Feature importance analysis</li>
                    <li>• Local interpretable model explanations</li>
                    <li>• Counterfactual explanations</li>
                    <li>• Attention mechanisms visualization</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary mb-3">Business Explainability</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Plain language decision summaries</li>
                    <li>• Key factors influencing decisions</li>
                    <li>• Decision confidence levels</li>
                    <li>• Alternative scenarios explanation</li>
                    <li>• Appeals and review processes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Oversight Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <h4 className="font-semibold text-secondary mb-2">Continuous Monitoring</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Performance metrics tracking</li>
                      <li>• Bias detection monitoring</li>
                      <li>• Data drift detection</li>
                    </ul>
                  </div>
                  <div className="bg-accent/5 p-4 rounded-lg">
                    <h4 className="font-semibold text-secondary mb-2">Regular Reviews</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Monthly performance reviews</li>
                      <li>• Quarterly bias assessments</li>
                      <li>• Annual model audits</li>
                    </ul>
                  </div>
                  <div className="bg-warning/5 p-4 rounded-lg">
                    <h4 className="font-semibold text-secondary mb-2">Incident Response</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Escalation procedures</li>
                      <li>• Root cause analysis</li>
                      <li>• Corrective action plans</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-secondary mb-3">Open Source Tools</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• LIME (Local Interpretable Model-agnostic Explanations)</li>
                    <li>• SHAP (SHapley Additive exPlanations)</li>
                    <li>• ELI5 (Explain Like I'm 5)</li>
                    <li>• Alibi (Algorithms for Explaining ML)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary mb-3">Commercial Solutions</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• IBM Watson OpenScale</li>
                    <li>• DataRobot MLOps</li>
                    <li>• Google What-If Tool</li>
                    <li>• Microsoft InterpretML</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Button 
              onClick={handleComplete}
              disabled={completeModuleMutation.isPending || savePlanMutation.isPending}
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
