
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  ExternalLink, 
 
  FileText, 
  Database,
  Shield
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ResourceBank() {

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const downloadTemplateMutation = useMutation({
    mutationFn: async (templateName: string) => {
      return apiRequest("POST", "/api/template-downloads", { templateName });
    },
    onSuccess: () => {
      toast({
        title: "Download Recorded",
        description: "Template download has been logged to your dashboard.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-metrics"] });
    },
  });



  const templates = [
    {
      name: "AI Model Inventory Template",
      description: "Structured template for uploading AI model details for classification",
      format: "CSV",
      downloads: "2.3k",
      category: "Templates",
      size: "2 KB",
      filePath: "/resources/templates/AI_Model_Inventory_Template.csv",
    },
  ];

  const handleDownload = (templateName: string, filePath?: string) => {
    downloadTemplateMutation.mutate(templateName);
    
    if (filePath) {
      // Download actual file for templates with file paths
      const element = document.createElement("a");
      element.setAttribute("href", filePath);
      element.setAttribute("download", filePath.split('/').pop() || `${templateName.toLowerCase().replace(/\s+/g, '-')}.csv`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      // Simulate download for other templates
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(`${templateName} - Download initiated`));
      element.setAttribute("download", `${templateName.toLowerCase().replace(/\s+/g, '-')}.txt`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const filteredTemplates = templates;



  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case "csv":
        return <Database className="h-4 w-4 text-emerald-500" />;
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "excel":
        return <Database className="h-4 w-4 text-green-500" />;
      case "word":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "google sheets":
        return <Database className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-secondary mb-4">
              Resource Bank
            </h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-8">
              Comprehensive collection of tools, templates, and resources for AI governance and compliance
            </p>
            

          </div>

          {/* Templates Section */}
          <div className="mb-12">
            <div className="flex items-center mb-8">
              <Download className="h-5 w-5 mr-2 text-primary" />
              <h2 className="text-2xl font-bold text-secondary">Templates</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{template.category}</Badge>
                          <div className="flex items-center text-sm text-slate-500">
                            {getFormatIcon(template.format)}
                            <span className="ml-1">{template.format}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                      <span>{template.downloads} downloads</span>
                      <span>{template.size}</span>
                    </div>
                    <Button
                      onClick={() => handleDownload(template.name, (template as any).filePath)}
                      disabled={downloadTemplateMutation.isPending}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {downloadTemplateMutation.isPending ? "Downloading..." : "Download"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No templates found</h3>
                <p className="text-slate-500">Try adjusting your search terms.</p>
              </div>
            )}
          </div>


        </div>
      </main>
      
      <Footer />
    </div>
  );
}
