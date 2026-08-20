import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Shield, Play, Book, Globe, TrendingUp, Scale, Eye, Map, Users, FileText, MessageSquare, Folder } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const { user } = useAuth();

  useEffect(() => {
    // Hotjar Tracking Code for Landing Page
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
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Navigate AI Compliance with Confidence
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Comprehensive governance toolkit designed specifically for FinTech SMEs. 
                Simplify GDPR, EU AI Act, and bias management with interactive tools and expert guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Button asChild className="bg-white text-blue-600 hover:bg-gray-50 font-semibold shadow-lg border border-white">
                    <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                      <Play className="mr-2 h-4 w-4 text-blue-600" />
                      Go to Dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild className="bg-white text-primary hover:bg-gray-50">
                      <Link href="/register">
                        <Play className="mr-2 h-4 w-4" />
                        Start Your Journey
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="border-white text-white hover:bg-white hover:text-primary bg-white/10 backdrop-blur-sm">
                      <Link href="/about">
                        <Book className="mr-2 h-4 w-4" />
                        About
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Scale className="mx-auto mb-2 h-8 w-8" />
                    <div className="text-sm">Compliance</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <TrendingUp className="mx-auto mb-2 h-8 w-8" />
                    <div className="text-sm">Risk Assessment</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Eye className="mx-auto mb-2 h-8 w-8" />
                    <div className="text-sm">Transparency</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Users className="mx-auto mb-2 h-8 w-8" />
                    <div className="text-sm">Bias Detection</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Modules Preview */}
      <section className="py-20 bg-slate-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-secondary dark:text-white mb-4">Interactive Governance Tools</h2>
            <p className="text-xl text-slate-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive tools designed to simplify AI governance for FinTech SMEs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {user ? (
              <>
                <Button asChild size="lg" className="flex items-center justify-center space-x-3 px-8 py-8 text-lg h-20" variant="outline">
                  <Link href="/dashboard">
                    <MessageSquare className="w-6 h-6" />
                    <span>RAG</span>
                  </Link>
                </Button>
                
                <Button asChild size="lg" className="flex items-center justify-center space-x-3 px-8 py-8 text-lg h-20" variant="outline">
                  <Link href="/modules/gdpr-risk-assessment">
                    <TrendingUp className="w-6 h-6" />
                    <span>Model Classification</span>
                  </Link>
                </Button>
                
                <Button asChild size="lg" className="flex items-center justify-center space-x-3 px-8 py-8 text-lg h-20" variant="outline">
                  <Link href="/modules/document-risk-analyzer">
                    <FileText className="w-6 h-6" />
                    <span>Document Analyser</span>
                  </Link>
                </Button>
                
                <Button asChild size="lg" className="flex items-center justify-center space-x-3 px-8 py-8 text-lg h-20" variant="outline">
                  <Link href="/resources">
                    <Folder className="w-6 h-6" />
                    <span>Resources</span>
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="flex items-center justify-center space-x-3 px-8 py-8 text-lg h-20" variant="outline">
                  <Link href="/register">
                    <MessageSquare className="w-6 h-6" />
                    <span>RAG</span>
                  </Link>
                </Button>
                
                <Button asChild size="lg" className="flex items-center justify-center space-x-3 px-8 py-8 text-lg h-20" variant="outline">
                  <Link href="/register">
                    <TrendingUp className="w-6 h-6" />
                    <span>Model Classification</span>
                  </Link>
                </Button>
                
                <Button asChild size="lg" className="flex items-center justify-center space-x-3 px-8 py-8 text-lg h-20" variant="outline">
                  <Link href="/register">
                    <FileText className="w-6 h-6" />
                    <span>Document Analyser</span>
                  </Link>
                </Button>
                
                <Button asChild size="lg" className="flex items-center justify-center space-x-3 px-8 py-8 text-lg h-20" variant="outline">
                  <Link href="/register">
                    <Folder className="w-6 h-6" />
                    <span>Resources</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
