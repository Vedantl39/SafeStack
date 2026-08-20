import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, Search, Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth";

export default function RiskAssessment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [aiActResult, setAiActResult] = useState<{
    answer: string;
    relevantArticles: string[];
    sources: string[];
  } | null>(null);

  const completeModuleMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/module-usage", {
        moduleName: "Risk Assessment",
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
        body: JSON.stringify({ query, module: "risk-assessment" }),
      });
      if (!response.ok) throw new Error("Failed to query AI Act");
      return response.json();
    },
    onSuccess: (result) => {
      setAiActResult(result);
      toast({
        title: "Risk Analysis Complete",
        description: "EU AI Act risk guidance has been generated.",
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

  const { data: highRiskCategories } = useQuery({
    queryKey: ["/api/ai-act/high-risk-categories"],
    queryFn: async () => {
      const token = authApi.getToken();
      const response = await fetch("/api/ai-act/high-risk-categories", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch high-risk categories");
      return response.json();
    },
  });

  const handleAIActSearch = () => {
    if (searchQuery.trim()) {
      aiActQueryMutation.mutate(searchQuery);
    }
  };

  const riskLevels = [
    {
      level: "Prohibited",
      color: "red",
      icon: XCircle,
      description: "AI practices that are completely banned under the EU AI Act",
      examples: ["Social scoring systems", "Subliminal manipulation techniques", "Exploitation of vulnerabilities"]
    },
    {
      level: "High Risk",
      color: "orange",
      icon: AlertTriangle,
      description: "AI systems requiring strict compliance and oversight",
      examples: ["Credit scoring", "Employment screening", "Essential service access"]
    },
    {
      level: "Limited Risk",
      color: "yellow",
      icon: TrendingUp,
      description: "AI systems with transparency obligations",
      examples: ["Chatbots", "AI-generated content", "Emotion recognition systems"]
    },
    {
      level: "Minimal Risk",
      color: "green",
      icon: CheckCircle,
      description: "AI systems with no specific legal obligations",
      examples: ["Spam filters", "AI-enabled video games", "Basic recommendation systems"]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-warning/10 p-3 rounded-lg mr-4">
              <TrendingUp className="text-warning h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-secondary dark:text-white">AI Risk Assessment</h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-gray-300 max-w-2xl mx-auto">
            Evaluate your AI systems according to EU AI Act risk categories and compliance requirements
          </p>
        </div>

        {/* AI Act Risk Query Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              EU AI Act Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about AI risk categories (e.g., 'Is credit scoring high-risk?')"
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
                <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2">EU AI Act Risk Assessment:</h4>
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

        {/* Risk Levels Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {riskLevels.map((risk) => {
            const IconComponent = risk.icon;
            return (
              <Card key={risk.level} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <IconComponent className={`h-8 w-8 text-${risk.color}-500 mr-3`} />
                    <h3 className="font-bold text-lg">{risk.level}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {risk.description}
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Examples:</p>
                    {risk.examples.map((example, index) => (
                      <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
                        • {example}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* High-Risk Categories from EU AI Act */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
              EU AI Act: High-Risk System Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {highRiskCategories ? (
              <div className="grid md:grid-cols-2 gap-4">
                {highRiskCategories.slice(0, 8).map((category: string, index: number) => (
                  <div key={index} className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-sm text-orange-800 dark:text-orange-200">{category}</p>
                  </div>
                ))}
                {highRiskCategories.length > 8 && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      +{highRiskCategories.length - 8} more high-risk categories
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-pulse grid md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
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
              "Complete Risk Assessment Module"
            )}
          </Button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}