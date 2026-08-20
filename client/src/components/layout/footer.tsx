import { Shield } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="text-2xl h-8 w-8" />
              <span className="text-xl font-bold">SafeStack</span>
            </div>
            <p className="text-slate-300 text-sm">
              Empowering FinTech SMEs with comprehensive AI governance tools and expert guidance.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link href="/resources" className="hover:text-white transition-colors">Download Templates</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <div className="text-sm text-slate-300">
              <p className="mb-2">
                SafeStack helps FinTech companies navigate AI compliance and governance requirements through intelligent risk assessment, bias detection, and regulatory guidance tools.
              </p>
              <p>
                <Link href="/about" className="hover:text-white transition-colors">Learn more about our mission</Link>
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-600 mt-12 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2025 SafeStack. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
