import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { GlobalChatWidget } from "./global-chat-widget";
import { useChatContext } from "@/hooks/use-chat-context";

export function AskSafeBotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { contextData } = useChatContext();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        Ask SafeBot
      </Button>

      {isOpen && (
        <GlobalChatWidget 
          contextData={contextData}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}