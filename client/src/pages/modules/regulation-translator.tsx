import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

export default function RegulationTranslator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your EU AI Act and GDPR assistant. I can help you understand complex regulations in simple terms. Ask me anything about:\n\n• EU AI Act requirements and obligations\n• GDPR compliance for AI systems\n• Risk assessments and categorization\n• Prohibited AI practices\n• Bias and fairness requirements\n• Documentation and compliance procedures\n\nWhat would you like to know?",
      timestamp: new Date(),
      sources: [],
      relevantArticles: []
    }
  ]);
  // Removed auto-scroll functionality - user controls scrolling manually

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const completeModuleMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/module-usage", {
        moduleName: "Regulation Translator",
      });
    },
    onSuccess: () => {
      toast({
        title: "Module Completed",
        description: "Your progress has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/module-usage"] });
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const token = authApi.getToken();
      const response = await fetch("/api/regulation-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: (result) => {
      const botMessage: ChatMessage = {
        id: Date.now().toString() + '_bot',
        type: 'bot',
        content: result.response,
        timestamp: new Date(),
        sources: result.sources || [],
        relevantArticles: result.relevantArticles || [],
        module: result.module
      };
      setMessages(prev => [...prev, botMessage]);
    },
    onError: (error) => {
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        type: 'bot',
        content: "I'm sorry, I'm having trouble accessing the regulatory documents right now. Please try again in a moment.",
        timestamp: new Date(),
        sources: [],
        relevantArticles: []
      };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: "Connection Error",
        description: "Please try your question again.",
        variant: "destructive",
      });
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
    "What are prohibited AI practices under the EU AI Act?",
    "How do I know if my AI system is high-risk?",
    "What are GDPR requirements for AI systems?",
    "Do I need human oversight for automated decisions?",
    "What documentation is required for AI compliance?",
    "How can I prevent bias in my AI system?"
  ];

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
              <MessageCircle className="text-primary h-8 w-8" />
            </motion.div>
            <h1 className="text-3xl font-bold text-secondary dark:text-white">Regulation Chat Assistant</h1>
          </motion.div>
          <motion.p 
            className="text-lg text-slate-600 dark:text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Ask questions about EU AI Act and GDPR in plain English. Get clear, actionable answers based on the actual regulations.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Quick Questions Sidebar */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-left text-xs h-auto p-2 justify-start whitespace-normal transition-all duration-200 hover:bg-primary/10 hover:scale-105"
                      onClick={() => setInputMessage(question)}
                      disabled={chatMutation.isPending}
                    >
                      {question}
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Chat Interface */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Card className="h-[600px] flex flex-col overflow-hidden">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center">
                  <Bot className="mr-2 h-5 w-5" />
                  EU AI Act & GDPR Chat
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {/* Messages Area */}
                <ScrollArea className="flex-1 px-4 overflow-y-auto">
                  <div className="space-y-4 pb-4 max-w-full overflow-hidden">
                    <AnimatePresence>
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.95 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: index === messages.length - 1 ? 0.1 : 0,
                            type: "spring",
                            stiffness: 300,
                            damping: 25
                          }}
                        >
                          <motion.div
                            className={`max-w-[90%] rounded-lg px-4 py-3 overflow-hidden ${
                              message.type === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          >
                            <div className="flex items-start gap-3 overflow-hidden">
                              {message.type === 'bot' && <Bot className="h-4 w-4 mt-1 flex-shrink-0" />}
                              {message.type === 'user' && <User className="h-4 w-4 mt-1 flex-shrink-0" />}
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <div className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: '100%' }}>{message.content}</div>
                                
                                {/* Sources and Articles */}
                                {message.sources && message.sources.length > 0 && (
                                  <motion.div 
                                    className="mt-2 space-y-1"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                  >
                                    <div className="flex flex-wrap gap-1">
                                      {message.sources.map((source, idx) => (
                                        <motion.div
                                          key={idx}
                                          initial={{ opacity: 0, scale: 0.8 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ duration: 0.2, delay: 0.3 + idx * 0.1 }}
                                          whileHover={{ scale: 1.05 }}
                                        >
                                          <Badge variant="secondary" className="text-xs transition-all duration-200">
                                            {source}
                                          </Badge>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                                
                                {message.relevantArticles && message.relevantArticles.length > 0 && (
                                  <motion.div 
                                    className="mt-1"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.4 }}
                                  >
                                    <div className="flex flex-wrap gap-1">
                                      {message.relevantArticles.map((article, idx) => (
                                        <motion.div
                                          key={idx}
                                          initial={{ opacity: 0, scale: 0.8 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ duration: 0.2, delay: 0.5 + idx * 0.1 }}
                                          whileHover={{ scale: 1.05 }}
                                        >
                                          <Badge variant="outline" className="text-xs transition-all duration-200">
                                            {article}
                                          </Badge>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                                
                                <div className="text-xs text-muted-foreground mt-1">
                                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {chatMutation.isPending && (
                      <motion.div 
                        className="flex justify-start"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div 
                          className="bg-muted rounded-lg px-4 py-2"
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Analyzing regulations...</span>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                    

                  </div>
                </ScrollArea>

                {/* Input Area */}
                <motion.div 
                  className="border-t p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about EU AI Act, GDPR, or compliance requirements..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={chatMutation.isPending}
                      className="flex-1 transition-all duration-200 focus:scale-[1.01]"
                    />
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Button
                        onClick={handleSendMessage}
                        disabled={chatMutation.isPending || !inputMessage.trim()}
                        size="icon"
                        className="transition-all duration-200"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Action Button */}
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Button 
              onClick={() => completeModuleMutation.mutate()}
              disabled={completeModuleMutation.isPending}
              size="lg"
              className="transition-all duration-200"
            >
              {completeModuleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Progress...
                </>
              ) : (
                "Complete Regulation Translator Module"
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}