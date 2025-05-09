import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/ChatMessage";
import TypingIndicator from "@/components/TypingIndicator";
import AnimatedButton from "@/components/AnimatedButton";
import { chatService } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage as ChatMessageType, Recipe } from "@shared/schema";

const ChatAssistant = ({ params }: { params?: { recipeId: string } }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Using proper type checking for parameter parsing
  const recipeId = params?.recipeId 
    ? parseInt(params.recipeId) 
    : undefined;
    
  // Make sure we have a valid numeric ID
  const validRecipeId = recipeId && !isNaN(recipeId) ? recipeId : undefined;
  
  // Log the route information for debugging
  console.log("Chat Assistant Route:", {
    hasParams: !!params,
    recipeId,
    validRecipeId
  });

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
    queryKey: [`/api/recipes/${validRecipeId}`],
    enabled: !!validRecipeId,
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
          ? `Hello! I'm your AI Chef, your personal cooking assistant. I can help with questions about the ${recipe.name} recipe, ingredient substitutions, cooking techniques, and more. What would you like to know?`
          : "Hello! I'm your AI Chef, your personal cooking assistant. I can help with recipe questions, ingredient substitutions, cooking techniques, and more. What would you like to know?",
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
        recipeId: validRecipeId,
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

  // Animation variants for chat elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div 
      className="h-screen flex flex-col bg-gradient-to-br from-background to-blue-50/30 dark:from-background dark:to-blue-950/20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Chat Header */}
      <motion.div 
        className="navbar px-4 py-3 flex items-center"
        variants={itemVariants}
      >
        <Button 
          onClick={handleBack} 
          className="p-2 mr-3 rounded-full"
          variant="ghost"
        >
          <i className="ri-arrow-left-line"></i>
        </Button>
        <div>
          <h2 className="font-bold font-heading text-primary text-lg">AI Chef</h2>
          <p className="text-xs text-foreground/70">
            {recipe ? `Discussing: ${recipe.name}` : "Your AI Cooking Assistant"}
          </p>
        </div>
      </motion.div>

      {/* Chat Background */}
      <div className="fixed inset-0 -z-10 bg-background pointer-events-none"></div>

      {/* Chat Messages */}
      <motion.div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-5"
        variants={itemVariants}
      >
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <ChatMessage message={msg} />
            </motion.div>
          ))}
          
          {sendMessageMutation.isPending && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <TypingIndicator label="Chef is cooking up a response" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chat Input */}
      <motion.div 
        className="bg-white dark:bg-slate-900 p-4 border-t border-neutral-200 dark:border-slate-700"
        variants={itemVariants}
      >
        <div className="relative">
          <Input
            type="text"
            placeholder="Ask anything about cooking..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full border border-neutral-200 dark:border-slate-700 py-4 pl-4 pr-12 focus:ring-2 focus:ring-primary/50 text-foreground"
          />
          <AnimatedButton
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 min-w-0 h-10 w-10 flex items-center justify-center ${message.trim() ? 'bg-primary text-white' : ''}`}
            onClick={handleSendMessage}
            disabled={sendMessageMutation.isPending || !message.trim()}
          >
            <i className="ri-send-plane-fill"></i>
          </AnimatedButton>
        </div>
        <div className="flex mt-3 overflow-x-auto hide-scrollbar snap-x gap-2">
          <Button
            variant="outline"
            className="snap-start whitespace-nowrap rounded-full py-1.5 px-3 text-sm border-neutral-200 dark:border-slate-700 hover:bg-neutral-100 dark:hover:bg-slate-800/50"
            onClick={() => handleQuickPrompt("How to make it spicy?")}
          >
            How to make it spicy?
          </Button>
          <Button
            variant="outline"
            className="snap-start whitespace-nowrap rounded-full py-1.5 px-3 text-sm border-neutral-200 dark:border-slate-700 hover:bg-neutral-100 dark:hover:bg-slate-800/50"
            onClick={() => handleQuickPrompt("Vegetarian options?")}
          >
            Vegetarian options?
          </Button>
          <Button
            variant="outline"
            className="snap-start whitespace-nowrap rounded-full py-1.5 px-3 text-sm border-neutral-200 dark:border-slate-700 hover:bg-neutral-100 dark:hover:bg-slate-800/50"
            onClick={() => handleQuickPrompt("Low-carb version?")}
          >
            Low-carb version?
          </Button>
          <Button
            variant="outline"
            className="snap-start whitespace-nowrap rounded-full py-1.5 px-3 text-sm border-neutral-200 dark:border-slate-700 hover:bg-neutral-100 dark:hover:bg-slate-800/50"
            onClick={() => handleQuickPrompt("Wine pairing?")}
          >
            Wine pairing?
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChatAssistant;