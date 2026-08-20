import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { AnalyticsProvider } from "@/hooks/use-analytics";
import { ThemeProvider } from "@/hooks/use-theme";
import { ChatContextProvider, useChatContext } from "@/hooks/use-chat-context";
import { GlobalChatWidget } from "@/components/chat/global-chat-widget";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import About from "@/pages/about";

import RiskAssessment from "@/pages/modules/risk-assessment";
import BiasFairness from "@/pages/modules/bias-fairness";
import Explainability from "@/pages/modules/explainability";
import ComplianceRoadmap from "@/pages/modules/compliance-roadmap";
import GDPRRiskAssessment from "@/pages/modules/gdpr-risk-assessment";
import DocumentRiskAnalyzer from "@/pages/modules/document-risk-analyzer";
import ResourceBank from "@/pages/resource-bank";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/about" component={About} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />

      <Route path="/modules/risk-assessment" component={RiskAssessment} />
      <Route path="/modules/bias-fairness" component={BiasFairness} />
      <Route path="/modules/explainability" component={Explainability} />
      <Route path="/modules/compliance-roadmap" component={ComplianceRoadmap} />
      <Route path="/modules/gdpr-risk-assessment" component={GDPRRiskAssessment} />
      <Route path="/modules/document-risk-analyzer" component={DocumentRiskAnalyzer} />
      <Route path="/resources" component={ResourceBank} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppWithChat() {
  const [location] = useLocation();
  const { contextData } = useChatContext();
  
  // Don't show chat widget on landing, login, or register pages
  const showChatWidget = !['/', '/login', '/register'].includes(location);

  return (
    <>
      <AppRouter />
      {showChatWidget && <GlobalChatWidget contextData={contextData} />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="safestack-ui-theme">
        <AuthProvider>
          <AnalyticsProvider>
            <TooltipProvider>
              <ChatContextProvider>
                <Toaster />
                <AppWithChat />
              </ChatContextProvider>
            </TooltipProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
