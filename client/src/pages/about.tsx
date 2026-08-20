import { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  TrendingUp, 
  FileText, 
  MessageSquare, 
  Users, 
  Globe, 
  CheckCircle,
  ArrowRight,
  Brain,
  Scale,
  Database
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function About() {
  const { user } = useAuth();

  useEffect(() => {
    // Hotjar Tracking Code for About Page
    const script = document.createElement('script');
    script.innerHTML = `
      <!-- Hotjar Tracking Code for Landing Page -->
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:6484065,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    `;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const scripts = document.head.querySelectorAll('script');
      scripts.forEach(s => {
        if (s.innerHTML.includes('6484065')) {
          document.head.removeChild(s);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Header />
      
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-secondary dark:text-white mb-6">
              About SafeStack
            </h1>
            <p className="text-xl text-slate-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              SafeStack is an AI-powered compliance platform designed specifically for FinTech SMEs. 
              We transform complex regulatory navigation into simple, actionable insights through 
              intelligent automation and expert guidance.
            </p>
          </div>

          {/* Mission Section */}
          <Card className="mb-12">
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold text-secondary dark:text-white mb-4">Our Mission</h2>
                  <p className="text-slate-600 dark:text-gray-300 mb-4">
                    Financial technology companies face an increasingly complex regulatory landscape. 
                    The EU AI Act, GDPR, and emerging compliance requirements create significant 
                    challenges for small and medium enterprises.
                  </p>
                  <p className="text-slate-600 dark:text-gray-300">
                    SafeStack bridges this gap by providing accessible, intelligent tools that 
                    democratize compliance expertise and enable FinTech SMEs to navigate regulations 
                    with confidence.
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/10 p-4 rounded-lg text-center">
                      <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-sm font-medium">Compliance</div>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg text-center">
                      <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">AI-Powered</div>
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg text-center">
                      <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">SME-Focused</div>
                    </div>
                    <div className="bg-purple-100 p-4 rounded-lg text-center">
                      <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">EU Regulatory</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tools Overview */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-secondary dark:text-white mb-8 text-center">
              Our Compliance Tools
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* RAG Assistant */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-3 rounded-lg mr-4">
                      <MessageSquare className="text-primary h-6 w-6" />
                    </div>
                    <CardTitle>RAG (SafeBot Assistant)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-gray-300 mb-4">
                    An intelligent AI assistant powered by Retrieval-Augmented Generation technology. 
                    SafeBot provides real-time regulatory guidance by analyzing the complete EU AI Act 
                    and GDPR documentation.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Context-aware responses based on current page</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Plain English explanations of complex regulations</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Available on every page for instant help</span>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={user ? "/dashboard" : "/register"}>
                      Try SafeBot <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Model Classification */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="bg-warning/10 p-3 rounded-lg mr-4">
                      <TrendingUp className="text-warning h-6 w-6" />
                    </div>
                    <CardTitle>AI Model Classification</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-gray-300 mb-4">
                    Automatically categorize your AI systems according to EU AI Act risk levels. 
                    Upload model inventories or classify individual systems to understand 
                    compliance requirements.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>High-Risk, Medium-Risk, Low-Risk, and Prohibited classifications</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Bulk CSV upload for model inventories</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Department-wise risk analytics and reporting</span>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={user ? "/modules/gdpr-risk-assessment" : "/register"}>
                      Start Classification <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Document Analyzer */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="bg-red-500/10 p-3 rounded-lg mr-4">
                      <FileText className="text-red-500 h-6 w-6" />
                    </div>
                    <CardTitle>Document Risk Analyzer</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-gray-300 mb-4">
                    Upload PDF and Word documents for AI-powered compliance risk analysis. 
                    Automatically detect sensitive data usage, missing oversight controls, 
                    and regulatory compliance gaps.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Sensitive data detection and categorization</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Human oversight and legal basis validation</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Risk scoring with actionable recommendations</span>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={user ? "/modules/document-risk-analyzer" : "/register"}>
                      Analyze Documents <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-500/10 p-3 rounded-lg mr-4">
                      <Database className="text-blue-500 h-6 w-6" />
                    </div>
                    <CardTitle>Resource Bank</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-gray-300 mb-4">
                    Access essential compliance templates and documentation tools. 
                    Download structured templates for AI model inventories, risk assessments, 
                    and regulatory reporting.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>AI Model Inventory Template (CSV format)</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Structured for bulk model classification</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Download tracking and usage analytics</span>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={user ? "/resources" : "/register"}>
                      Browse Resources <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How It Works */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl text-center">How SafeStack Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Assess</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-300">
                    Upload your AI models or documents for automated risk classification and compliance analysis
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Analyze</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-300">
                    Our AI-powered tools provide detailed risk analysis, compliance gaps, and regulatory guidance
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Act</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-300">
                    Implement recommendations, download templates, and maintain ongoing compliance monitoring
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology */}
          <Card className="mb-12">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-secondary dark:text-white mb-4">
                  Powered by Advanced AI Technology
                </h2>
                <p className="text-slate-600 dark:text-gray-300 max-w-3xl mx-auto">
                  SafeStack leverages cutting-edge artificial intelligence to provide accurate, 
                  context-aware regulatory guidance and automated compliance analysis.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-slate-100 dark:bg-gray-800 rounded-lg">
                  <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">OpenAI Integration</h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                    Advanced language models for document analysis
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-100 dark:bg-gray-800 rounded-lg">
                  <Database className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">RAG Technology</h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                    Retrieval-augmented generation for precise answers
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-100 dark:bg-gray-800 rounded-lg">
                  <Scale className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">EU AI Act Compliance</h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                    Built on official regulatory documentation
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-100 dark:bg-gray-800 rounded-lg">
                  <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Risk Analytics</h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                    Real-time risk assessment and monitoring
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-secondary dark:text-white mb-4">
              Ready to Simplify Your AI Compliance?
            </h2>
            <p className="text-slate-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join the growing number of FinTech SMEs using SafeStack to navigate 
              AI regulations with confidence and precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/register">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">
                  Try SafeBot Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}