import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { clientDataInputSchema, type ClientDataInput } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface RiskAssessmentResult {
  riskLevel: 'Low' | 'Medium' | 'High';
  reasons: string[];
  recommendations: string[];
  sensitiveDataDetected: boolean;
  sensitiveKeywords: string[];
}

export function ClientDataForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<RiskAssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ClientDataInput>({
    resolver: zodResolver(clientDataInputSchema),
    defaultValues: {
      name: "",
      income: 0,
      location: "",
      financialBehavior: "",
      usesAI: false,
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let data: any = {};

        if (file.name.endsWith('.json')) {
          data = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          // Simple CSV parsing for the first row of data
          const lines = content.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          const values = lines[1]?.split(',').map(v => v.trim()) || [];
          
          headers.forEach((header, index) => {
            if (values[index]) {
              data[header.toLowerCase()] = values[index];
            }
          });
        }

        // Map the data to form fields
        if (data.name) form.setValue('name', data.name);
        if (data.income) form.setValue('income', parseFloat(data.income) || 0);
        if (data.location) form.setValue('location', data.location);
        if (data.financialBehavior || data.financial_behavior) form.setValue('financialBehavior', data.financialBehavior || data.financial_behavior);
        if (data.usesAI !== undefined || data.uses_ai !== undefined) {
          form.setValue('usesAI', data.usesAI === 'true' || data.uses_ai === 'true' || data.usesAI === true);
        }
      } catch (err) {
        setError('Failed to parse file. Please ensure it\'s a valid JSON or CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const onSubmit = async (data: ClientDataInput) => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiRequest('POST', '/api/risk-assessment', data);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to assess risk');
      }

      const result: RiskAssessmentResult = await response.json();
      setResult(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred during risk assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-600 dark:text-red-400';
      case 'Medium': return 'text-amber-600 dark:text-amber-400';
      case 'Low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'High': return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'Medium': return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      case 'Low': return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">GDPR Risk Assessment</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Assess the GDPR compliance risk level for client data processing
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                  Upload a file
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400"> or fill the form manually</span>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                CSV or JSON files supported
              </p>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name" className="text-gray-900 dark:text-white">Name</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  placeholder="Client name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="income" className="text-gray-900 dark:text-white">Income</Label>
                <Input
                  id="income"
                  type="number"
                  {...form.register('income', { valueAsNumber: true })}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  placeholder="Annual income"
                />
                {form.formState.errors.income && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {form.formState.errors.income.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="location" className="text-gray-900 dark:text-white">Location</Label>
                <Input
                  id="location"
                  {...form.register('location')}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  placeholder="Client location"
                />
                {form.formState.errors.location && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {form.formState.errors.location.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="financialBehavior" className="text-gray-900 dark:text-white">Financial Behavior</Label>
              <Textarea
                id="financialBehavior"
                {...form.register('financialBehavior')}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                placeholder="Describe financial behavior patterns..."
                rows={3}
              />
              {form.formState.errors.financialBehavior && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {form.formState.errors.financialBehavior.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="usesAI"
                checked={form.watch('usesAI')}
                onCheckedChange={(checked) => form.setValue('usesAI', !!checked)}
              />
              <Label htmlFor="usesAI" className="text-gray-900 dark:text-white">
                Will this data be used in an AI model?
              </Label>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Assessing Risk...' : 'Assess GDPR Risk'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              {getRiskIcon(result.riskLevel)}
              Risk Assessment Result: <span className={getRiskColor(result.riskLevel)}>{result.riskLevel} Risk</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Risk Factors:</h4>
              <ul className="list-disc list-inside space-y-1">
                {result.reasons.map((reason, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{reason}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recommendations:</h4>
              <ul className="list-disc list-inside space-y-1">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{rec}</li>
                ))}
              </ul>
            </div>

            {result.sensitiveDataDetected && result.sensitiveKeywords.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">Sensitive Data Detected:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.sensitiveKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}