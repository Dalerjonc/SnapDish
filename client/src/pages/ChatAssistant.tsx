import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/ChatMessage";
import { chatService } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage as ChatMessageType, Recipe } from "@shared/schema";

const ChatAssistant = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [routeRecipe] = useRoute("/chat/:recipeId");
  const [routeGeneral] = useRoute("/chat");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Added more robust parameter parsing
  const recipeId = routeRecipe && routeRecipe.params && routeRecipe.params.recipeId 
    ? parseInt(routeRecipe.params.recipeId) 
    : undefined;

  // Get chat history
  const { data: chatHistory } = useQuery<ChatMessageType[]>({
    queryKey: ["/api/chat/history"]
  });

  // Update messages when chat history is loaded
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      setMessages(chatHistory);
    }
  }, [chatHistory]);

  // If we have a recipe ID, get the recipe details
  const { data: recipe } = useQuery<Recipe>({
    queryKey: [`/api/recipes/${recipeId}`],
    enabled: !!recipeId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ message, recipeId }: { message: string; recipeId?: number }) => 
      chatService.sendMessage(message, recipeId),
    onSuccess: (data) => {
      setMessages(prev => [...prev, data]);
      scrollToBottom();
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // On component mount, add a welcome message if no messages yet
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessageType = {
        role: "assistant",
        content: recipe 
          ? `Hello! I'm your cooking assistant. I can help with questions about the ${recipe.name} recipe, ingredient substitutions, cooking techniques, and more. What would you like to know?`
          : "Hello! I'm your cooking assistant. I can help with recipe questions, ingredient substitutions, cooking techniques, and more. What would you like to know?",
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, recipe]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // Add user message to the chat
      const userMessage: ChatMessageType = {
        role: "user",
        content: message,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Send to API
      sendMessageMutation.mutate({ 
        message,
        recipeId,
      });
      
      // Clear input
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt);
  };

  const handleBack = () => {
    if (recipeId) {
      navigate(`/recipe/${recipeId}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Chat Header */}
      <div className="border-b border-neutral-200 px-4 py-3 flex items-center">
        <button onClick={handleBack} className="p-2 mr-3">
          <i className="ri-arrow-left-line"></i>
        </button>
        <div>
          <h2 className="font-bold font-heading">AI Cooking Assistant</h2>
          <p className="text-xs text-neutral-500">
            {recipe ? `Discussing: ${recipe.name}` : "Ask any cooking questions"}
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        
        {sendMessageMutation.isPending && (
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white mr-2 flex-shrink-0">
              <i className="ri-loader-4-line animate-spin"></i>
            </div>
            <div className="chat-bubble bg-neutral-100 px-4 py-3 max-w-[80%] text-sm">
              <div className="flex space-x-2">
                <div className="h-2 w-2 bg-neutral-300 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-neutral-300 rounded-full animate-bounce delay-150"></div>
                <div className="h-2 w-2 bg-neutral-300 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="border-t border-neutral-200 p-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Ask anything about cooking..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full border border-neutral-300 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          <Button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-full"
            onClick={handleSendMessage}
            disabled={sendMessageMutation.isPending || !message.trim()}
          >
            <i className="ri-send-plane-fill"></i>
          </Button>
        </div>
        <div className="flex mt-2 overflow-x-auto hide-scrollbar snap-x gap-2">
          <Button
            variant="outline"
            className="snap-start whitespace-nowrap bg-neutral-100 rounded-full py-1.5 px-3 text-sm border-0 hover:bg-neutral-200"
            onClick={() => handleQuickPrompt("How to make it spicy?")}
          >
            How to make it spicy?
          </Button>
          <Button
            variant="outline"
            className="snap-start whitespace-nowrap bg-neutral-100 rounded-full py-1.5 px-3 text-sm border-0 hover:bg-neutral-200"
            onClick={() => handleQuickPrompt("Vegetarian options?")}
          >
            Vegetarian options?
          </Button>
          <Button
            variant="outline"
            className="snap-start whitespace-nowrap bg-neutral-100 rounded-full py-1.5 px-3 text-sm border-0 hover:bg-neutral-200"
            onClick={() => handleQuickPrompt("Low-carb version?")}
          >
            Low-carb version?
          </Button>
          <Button
            variant="outline"
            className="snap-start whitespace-nowrap bg-neutral-100 rounded-full py-1.5 px-3 text-sm border-0 hover:bg-neutral-200"
            onClick={() => handleQuickPrompt("Wine pairing?")}
          >
            Wine pairing?
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
