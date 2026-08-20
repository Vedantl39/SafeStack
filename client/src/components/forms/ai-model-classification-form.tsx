import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Plus, AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth";
import { ClassificationResultsTable } from "@/components/tables/classification-results-table";

const aiModelSchema = z.object({
  modelName: z.string().min(1, "Model name is required"),
  department: z.string().optional(),
  modelOwner: z.string().optional(),
  purpose: z.string().min(1, "Purpose is required"),
  useCaseType: z.string().min(1, "Use case type is required"),
  inputData: z.string().optional(),
  riskTier: z.enum(["High", "Medium", "Low"]),
  legalNotes: z.string().optional(),
});

type AiModelFormData = z.infer<typeof aiModelSchema>;

export function AiModelClassificationForm() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: classifications } = useQuery({
    queryKey: ["/api/ai-model-classifications"],
  });

  const form = useForm<AiModelFormData>({
    resolver: zodResolver(aiModelSchema),
    defaultValues: {
      modelName: "",
      department: "",
      modelOwner: "",
      purpose: "",
      useCaseType: "",
      inputData: "",
      riskTier: "Low",
      legalNotes: "",
    },
  });

  const classifyModelMutation = useMutation({
    mutationFn: async (data: AiModelFormData) => {
      return await apiRequest("/api/ai-model-classifications", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Model classified successfully",
        description: "The AI model has been classified and saved.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/ai-model-classifications"] });
    },
    onError: (error) => {
      toast({
        title: "Classification failed",
        description: error.message || "Failed to classify the model. Please try again.",
        variant: "destructive",
      });
    },
  });

  const processCsvMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const token = authApi.getToken();
      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }
      
      const response = await fetch("/api/ai-model-classifications/csv", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process CSV file");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "CSV processed successfully",
        description: `Processed ${data.count} AI models from CSV file.`,
      });
      setCsvFile(null);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ["/api/ai-model-classifications"] });
    },
    onError: (error) => {
      toast({
        title: "CSV processing failed",
        description: error.message || "Failed to process CSV file. Please check the format and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AiModelFormData) => {
    classifyModelMutation.mutate(data);
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
    }
  };

  const processCsv = () => {
    if (csvFile) {
      setIsProcessingCsv(true);
      processCsvMutation.mutate(csvFile);
    }
  };

  const handleDownloadResults = () => {
    if (!classifications || classifications.length === 0) {
      toast({
        title: "No data to download",
        description: "Please classify some models first.",
        variant: "destructive",
      });
      return;
    }

    const csvHeaders = [
      'Model Name', 'Department', 'Model Owner', 'Purpose', 'Use Case Type', 
      'Input Data', 'Last Updated', 'Legal Status'
    ];

    const csvData = classifications.map((item: any) => [
      item.modelName,
      item.department,
      item.modelOwner,
      item.purpose,
      item.useCaseType,
      item.inputData,
      new Date(item.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      item.legalNotes || 'Pending'
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ai_model_classifications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: "Classification results have been downloaded as CSV file.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* CSV Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Upload from CSV
          </CardTitle>
          <CardDescription>
            Upload a CSV file with multiple AI models for batch classification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Click to select CSV file or drag and drop
                </span>
                <span className="text-xs text-gray-500">
                  Required columns: model_name, purpose, use_case_type
                </span>
              </label>
            </div>
            
            {csvFile && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium">{csvFile.name}</span>
                <Button
                  onClick={processCsv}
                  disabled={isProcessingCsv || processCsvMutation.isPending}
                  className="ml-4"
                >
                  {isProcessingCsv || processCsvMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Process CSV"
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Entry Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Individual AI Model
          </CardTitle>
          <CardDescription>
            Manually enter details for a single AI model classification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="modelName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Credit Risk Scorer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Risk Management" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="modelOwner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Owner</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="riskTier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Tier</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select risk tier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the purpose of this AI model"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="useCaseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Use Case Type *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Credit scoring, Fraud detection" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inputData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input Data</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the input data used by this model"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="legalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any legal considerations or compliance notes"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={classifyModelMutation.isPending}
                className="w-full"
              >
                {classifyModelMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Classifying Model...
                  </>
                ) : (
                  "Classify AI Model"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Information Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          All AI models will be automatically classified according to EU AI Act regulations.
          The system will analyze the purpose and use case to determine the appropriate risk category.
        </AlertDescription>
      </Alert>

      {/* Results Table */}
      {showResults && classifications && classifications.length > 0 && (
        <ClassificationResultsTable 
          classifications={classifications as any[]} 
          onDownload={handleDownloadResults}
        />
      )}
    </div>
  );
}