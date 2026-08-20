import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface ChatContextData {
  currentPage: string;
  pageData?: any;
  lastClassifications?: any[];
  lastDocumentAnalyses?: any[];
  dashboardMetrics?: any;
}

interface ChatContextType {
  contextData: ChatContextData;
  updateContextData: (data: Partial<ChatContextData>) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatContextProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [contextData, setContextData] = useState<ChatContextData>({
    currentPage: location
  });

  // Update current page when location changes
  useEffect(() => {
    setContextData(prev => ({ ...prev, currentPage: location }));
  }, [location]);

  // Fetch relevant data based on current page
  const { data: classifications } = useQuery({
    queryKey: ['/api/ai-model-classifications'],
    enabled: location.includes('classification') || location === '/dashboard',
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { data: documentAnalyses } = useQuery({
    queryKey: ['/api/document-analyses'],
    enabled: location.includes('document-risk-analyzer') || location === '/dashboard',
    staleTime: 5 * 60 * 1000,
  });

  const { data: dashboardMetrics } = useQuery({
    queryKey: ['/api/dashboard-metrics'],
    enabled: location === '/dashboard',
    staleTime: 5 * 60 * 1000,
  });

  // Update context data when queries return
  useEffect(() => {
    setContextData(prev => ({
      ...prev,
      lastClassifications: Array.isArray(classifications) ? classifications.slice(0, 5) : [], // Last 5 classifications
      lastDocumentAnalyses: Array.isArray(documentAnalyses) ? documentAnalyses.slice(0, 5) : [], // Last 5 analyses
      dashboardMetrics
    }));
  }, [classifications, documentAnalyses, dashboardMetrics]);

  const updateContextData = (data: Partial<ChatContextData>) => {
    setContextData(prev => ({ ...prev, ...data }));
  };

  return (
    <ChatContext.Provider value={{ contextData, updateContextData }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatContextProvider');
  }
  return context;
}