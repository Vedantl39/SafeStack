import { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AiModelClassificationForm } from "@/components/forms/ai-model-classification-form";
import { useClickTracking } from "@/hooks/use-analytics";

export default function ModelClassification() {
  const trackClick = useClickTracking('model-classification');

  useEffect(() => {
    // Hotjar Tracking Code for Model Classification Page
    const script = document.createElement('script');
    script.innerHTML = `
      <!-- Hotjar Tracking Code for https://safestackucd.replit.app/modules/gdpr-risk-assessment -->
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:6484034,hjsv:6};
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
        if (s.innerHTML.includes('6484034')) {
          document.head.removeChild(s);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              AI Model Classification
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Classify AI models according to EU AI Act regulations and assess compliance risks
            </p>
          </div>

          <AiModelClassificationForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}