import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scale, Search, Loader2, Users, CheckCircle, AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth";

export default function BiasAndFairness() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [aiActResult, setAiActResult] = useState<{
    answer: string;
    relevantArticles: string[];
    sources: string[];
  } | null>(null);

  const completeModuleMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/module-usage", {
        moduleName: "Bias & Fairness",
      });
    },
    onSuccess: () => {
      toast({
        title: "Module Completed",
        description: "Your progress has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/module-usage"] });
    },
  });

  const aiActQueryMutation = useMutation({
    mutationFn: async (query: string) => {
      const token = authApi.getToken();
      const response = await fetch("/api/ai-act/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ query, module: "bias-fairness" }),
      });
      if (!response.ok) throw new Error("Failed to query AI Act");
      return response.json();
    },
    onSuccess: (result) => {
      setAiActResult(result);
      toast({
        title: "Bias Analysis Complete",
        description: "EU AI Act fairness guidance has been generated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze EU AI Act. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAIActSearch = () => {
    if (searchQuery.trim()) {
      aiActQueryMutation.mutate(searchQuery);
    }
  };

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [itemId]: checked }));
  };

  const biasChecklist = [
    {
      id: "data-diversity",
      category: "Data Quality",
      item: "Training data represents diverse demographic groups",
      description: "Ensure your datasets include varied ages, genders, ethnicities, and socioeconomic backgrounds"
    },
    {
      id: "protected-characteristics",
      category: "Fundamental Rights",
      item: "System does not discriminate based on protected characteristics",
      description: "Avoid bias based on race, gender, age, religion, disability, or sexual orientation"
    },
    {
      id: "human-oversight",
      category: "Human Oversight",
      item: "Human review process for automated decisions",
      description: "Implement meaningful human oversight for all AI-driven decisions affecting individuals"
    },
    {
      id: "transparency",
      category: "Transparency",
      item: "Clear information provided about automated processing",
      description: "Users must understand when and how AI systems make decisions about them"
    },
    {
      id: "testing-validation",
      category: "Testing",
      item: "Regular bias testing across different demographic groups",
      description: "Continuously monitor system performance for unfair outcomes across populations"
    },
    {
      id: "feedback-mechanism",
      category: "Rights Protection",
      item: "Mechanism for users to challenge automated decisions",
      description: "Provide clear process for individuals to contest AI-driven decisions"
    },
    {
      id: "impact-assessment",
      category: "Risk Management",
      item: "Fundamental rights impact assessment conducted",
      description: "Evaluate potential impacts on fundamental rights before deployment"
    },
    {
      id: "documentation",
      category: "Compliance",
      item: "Bias mitigation measures documented",
      description: "Maintain records of bias prevention and mitigation strategies implemented"
    }
  ];

  const fairnessPrinciples = [
    {
      title: "Individual Fairness",
      description: "Similar individuals should receive similar treatment",
      icon: Users,
      color: "blue"
    },
    {
      title: "Group Fairness",
      description: "Equal outcomes across different demographic groups",
      icon: Scale,
      color: "green"
    },
    {
      title: "Procedural Fairness",
      description: "Fair and transparent decision-making processes",
      icon: CheckCircle,
      color: "purple"
    },
    {
      title: "Counterfactual Fairness",
      description: "Decisions would be the same in a counterfactual world",
      icon: AlertTriangle,
      color: "orange"
    }
  ];

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const completionPercentage = Math.round((checkedCount / biasChecklist.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-accent/10 p-3 rounded-lg mr-4">
              <Scale className="text-accent h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-secondary dark:text-white">Bias & Fairness</h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-gray-300 max-w-2xl mx-auto">
            Ensure your AI systems are fair, unbiased, and compliant with fundamental rights requirements
          </p>
        </div>

        {/* AI Act Fairness Query Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              EU AI Act: Fairness & Rights Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about fairness requirements (e.g., 'What are fundamental rights obligations?')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAIActSearch()}
                />
                <Button 
                  onClick={handleAIActSearch}
                  disabled={aiActQueryMutation.isPending || !searchQuery.trim()}
                >
                  {aiActQueryMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {aiActResult && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2">EU AI Act Fairness Guidance:</h4>
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {aiActResult.answer}
                  </div>
                  {aiActResult.relevantArticles.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Relevant Articles: {aiActResult.relevantArticles.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fairness Principles */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {fairnessPrinciples.map((principle) => {
            const IconComponent = principle.icon;
            return (
              <Card key={principle.title}>
                <CardContent className="p-6 text-center">
                  <IconComponent className={`h-8 w-8 text-${principle.color}-500 mx-auto mb-3`} />
                  <h3 className="font-bold text-lg mb-2">{principle.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {principle.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Progress Indicator */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Bias & Fairness Checklist</span>
              <span className="text-sm font-normal">
                {checkedCount}/{biasChecklist.length} completed ({completionPercentage}%)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>

            <div className="space-y-6">
              {Object.entries(
                biasChecklist.reduce((acc, item) => {
                  if (!acc[item.category]) acc[item.category] = [];
                  acc[item.category].push(item);
                  return acc;
                }, {} as Record<string, typeof biasChecklist>)
              ).map(([category, items]) => (
                <div key={category}>
                  <h4 className="font-semibold text-lg mb-3 text-accent">{category}</h4>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white dark:bg-gray-800 border">
                        <Checkbox
                          id={item.id}
                          checked={checkedItems[item.id] || false}
                          onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <label 
                            htmlFor={item.id} 
                            className="text-sm font-medium cursor-pointer"
                          >
                            {item.item}
                          </label>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {completionPercentage === 100 && (
              <Alert className="mt-6">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Excellent! You've completed the bias and fairness checklist. Your AI system is aligned with EU AI Act fundamental rights requirements.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="text-center">
          <Button 
            onClick={() => completeModuleMutation.mutate()}
            disabled={completeModuleMutation.isPending}
            size="lg"
          >
            {completeModuleMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Progress...
              </>
            ) : (
              "Complete Bias & Fairness Module"
            )}
          </Button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}