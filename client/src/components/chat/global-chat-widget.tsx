import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User, Loader2, X, Minimize2, Maximize2, Minimize } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { authApi } from "@/lib/auth";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  sources?: string[];
  relevantArticles?: string[];
  module?: string;
}

interface GlobalChatWidgetProps {
  contextData?: {
    currentPage: string;
    pageData?: any;
  };
  onClose?: () => void;
}

export function GlobalChatWidget({ contextData, onClose }: GlobalChatWidgetProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false); // Starts as a launcher button so it never covers forms
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with context-aware welcome message
  useEffect(() => {
    const welcomeMessage = getContextualWelcomeMessage(location);
    setMessages([{
      id: '1',
      type: 'bot',
      content: welcomeMessage,
      timestamp: new Date(),
      sources: [],
      relevantArticles: []
    }]);
  }, [location]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function getContextualWelcomeMessage(currentPath: string): string {
    const pathContext = {
      '/dashboard': "I can see you're reviewing your compliance dashboard. Would you like me to explain any of your model classifications or document analyses, or help you prioritize what to work on next?",
      '/modules/document-risk-analyzer': "I'm here to help with your document analysis. Are you looking to understand your risk results, or would you like guidance on addressing any detected compliance issues?",
      '/modules/gdpr-risk-assessment': "I can help you understand AI model risk classifications and guide you through EU AI Act compliance requirements. What specific system are you working on?",
      '/modules/regulation-translator': "I can help break down complex GDPR and EU AI Act regulations into simple, actionable guidance. What specific regulation or requirement would you like me to explain?",
      '/modules/bias-fairness': "I can help you tackle bias testing and fairness requirements for your AI systems. What's your biggest concern about ensuring fairness in your models?",
      '/resources': "I can help you choose the right templates and tools for your compliance needs. What specific area are you focusing on right now?"
    };

    const contextMessage = pathContext[currentPath as keyof typeof pathContext] || 
      "I'm here to guide you through EU AI Act and GDPR compliance step by step. What compliance challenge can I help you tackle today?";

    return `Hello! I'm SafeBot, your AI compliance assistant. ${contextMessage}`;
  }

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const token = authApi.getToken();
      
      // Add context to the message for better responses
      const contextualMessage = `${message}

Current page: ${location}
${contextData?.pageData ? `Page data context: ${JSON.stringify(contextData.pageData)}` : ''}`;

      const response = await fetch("/api/regulation-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ message: contextualMessage }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: (data) => {
      let botContent = data.response;
      
      // Remove "EU AI Act (Regulation 2024/1689)" from responses
      botContent = botContent.replace(/EU AI Act \(Regulation 2024\/1689\)\s*/gi, '');
      
      // Filter out EU AI Act regulation from sources
      const filteredSources = (data.sources || []).filter(
        (source: string) => !source.includes('EU AI Act (Regulation 2024/1689)')
      );
      
      const botMessage: ChatMessage = {
        id: Date.now().toString() + '_bot',
        type: 'bot',
        content: botContent,
        timestamp: new Date(),
        sources: filteredSources,
        relevantArticles: data.relevantArticles || [],
        module: data.module
      };
      setMessages(prev => [...prev, botMessage]);
    },
    onError: (error) => {
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        type: 'bot',
        content: "⚠️ Sorry, I didn't understand that. Please try rephrasing your question.",
        timestamp: new Date(),
        sources: [],
        relevantArticles: []
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '_user',
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setHasUserInteracted(true); // Hide quick questions after first user message
    chatMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "How do I classify my AI models?",
    "What documents should I analyze first?", 
    "Explain EU AI Act risk categories",
    "Help me understand bias requirements"
  ];

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          aria-label="Open SafeBot, the AI assistant"
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Card className={`${isExpanded ? 'w-[600px] h-[800px]' : 'w-96'} shadow-2xl border-2 ${isMinimized ? 'h-auto' : isExpanded ? 'h-[800px]' : 'h-[600px]'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <span>
              SafeBot Assistant
              <span className="block text-xs font-normal text-slate-500">You're chatting with an AI. Answers may be wrong; check important points.</span>
            </span>
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
              title={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? <Minimize className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0"
              title={isMinimized ? "Show" : "Minimize"}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                onClose?.();
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <CardContent className="p-0 flex flex-col h-[520px]">
                {/* Quick Questions - Only show before first user interaction */}
                {!hasUserInteracted && (
                  <div className="p-4 border-b bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-2">Quick questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.map((question) => (
                        <Button
                          key={question}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => {
                            setInputMessage(question);
                            setTimeout(() => handleSendMessage(), 100); // Small delay to ensure input is set
                          }}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.type === 'bot' && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                          <div
                            className={`p-3 rounded-lg ${
                              message.type === 'user'
                                ? 'bg-primary text-primary-foreground ml-auto'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {message.sources
                                .filter(source => !source.includes('EU AI Act (Regulation 2024/1689)'))
                                .map((source, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        {message.type === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {chatMutation.isPending && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 justify-start"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about regulations, risks, or compliance..."
                      className="flex-1"
                      disabled={chatMutation.isPending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || chatMutation.isPending}
                      size="sm"
                    >
                      {chatMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}