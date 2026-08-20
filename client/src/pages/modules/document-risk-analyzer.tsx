import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, AlertTriangle, CheckCircle, FileIcon, Loader2, Scan } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth";

interface RiskDetection {
  chunk: string;
  risk_category: string;
  explanation: string;
}

interface AnalysisResult {
  extracted_text: string;
  detections: RiskDetection[];
  overall_risk: 'High' | 'Medium' | 'Low' | 'None';
}

export default function DocumentRiskAnalyzer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);



  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      
      const token = authApi.getToken();
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to analyze document');
      return response.json();
    },
    onSuccess: (result: AnalysisResult) => {
      setExtractedText(result.extracted_text);
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: `Document analyzed with ${result.overall_risk.toLowerCase()} risk level detected.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze document. Please try again.",
        variant: "destructive",
      });
    },
  });



  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractedText("");
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const getRiskColor = (tier: string) => {
    switch (tier) {
      case 'Prohibited':
      case 'High-Risk': 
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium-Risk':
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low-Risk':
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Unregulated':
      case 'None': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (tier: string) => {
    switch (tier) {
      case 'Prohibited':
      case 'High-Risk': 
      case 'High': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'Medium-Risk':
      case 'Medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'Low-Risk':
      case 'Low': return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      case 'Unregulated':
      case 'None': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div 
            className="flex items-center justify-center mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div 
              className="bg-primary/10 p-3 rounded-lg mr-4"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Scan className="text-primary h-8 w-8" />
            </motion.div>
            <h1 className="text-3xl font-bold text-secondary dark:text-white">Document Risk Analyzer</h1>
          </motion.div>
          <motion.p 
            className="text-lg text-slate-600 dark:text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Upload PDF or Word documents to automatically detect compliance risks, sensitive data usage, and regulatory concerns using AI-powered analysis.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Document Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {selectedFile ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-3"
                    >
                      <FileIcon className="mx-auto h-12 w-12 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button
                          onClick={handleAnalyze}
                          disabled={uploadMutation.isPending}
                          className="flex items-center gap-2"
                        >
                          {uploadMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Scan className="h-4 w-4" />
                              Analyze Document
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedFile(null);
                            setExtractedText("");
                            setAnalysisResult(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Upload a document</p>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, or DOCX files up to 10MB
                        </p>
                      </div>
                      <Button onClick={() => fileInputRef.current?.click()}>
                        Choose File
                      </Button>
                    </motion.div>
                  )}
                </div>

                {extractedText && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-sm font-medium mb-2">Extracted Text</h3>
                    <Textarea
                      value={extractedText}
                      readOnly
                      className="h-40 text-xs"
                      placeholder="Document text will appear here..."
                    />
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Risk Analysis Results
                  </span>
                  {analysisResult && (
                    <Badge className={getRiskColor(analysisResult.overall_risk)}>
                      {analysisResult.overall_risk} Risk
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysisResult ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                  >
                    <ScrollArea className="h-96">
                      <AnimatePresence>
                        {analysisResult.detections.length > 0 ? (
                          analysisResult.detections.map((detection, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: index * 0.1 }}
                              className="mb-4 p-4 border rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getRiskIcon(detection.risk_category)}
                                  <span className="font-medium text-sm">
                                    {detection.risk_category} Risk Detection
                                  </span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  Chunk {index + 1}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2 mb-3">
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                  <strong>Explanation:</strong> {detection.explanation}
                                </div>
                              </div>
                              
                              <div className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded text-gray-600 dark:text-gray-300">
                                {detection.chunk.length > 200 
                                  ? `${detection.chunk.substring(0, 200)}...` 
                                  : detection.chunk}
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-8 text-gray-500"
                          >
                            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                            <p>No significant risks detected in this document.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </ScrollArea>
                  </motion.div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center min-h-[200px] flex flex-col justify-center">
                    <FileText className="mx-auto h-12 w-12 mb-4 text-gray-400 dark:text-gray-500" />
                    <p className="text-gray-500 dark:text-gray-400">Upload and analyze a document to see risk assessment results.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>


      </div>
      
      <Footer />
    </div>
  );
}