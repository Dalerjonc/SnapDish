import { ChatMessage as ChatMessageType } from "@shared/schema";
import { motion } from "framer-motion";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const { role, content } = message;
  const isUser = role === "user";
  
  // Format content that contains lists
  const formatContent = (text: string) => {
    if (!text.includes("\n")) return <p>{text}</p>;
    
    return text.split("\n").map((line, index) => {
      // Check if line is a numbered list item
      const numberedListMatch = line.match(/^(\d+)\.\s+(.+)/);
      if (numberedListMatch) {
        return (
          <div key={index} className="flex items-start ml-3 mt-1.5">
            <span className="mr-2 font-medium text-primary dark:text-primary-foreground">{numberedListMatch[1]}.</span>
            <span>{numberedListMatch[2]}</span>
          </div>
        );
      }
      
      // Check if line is a bullet list item
      const bulletListMatch = line.match(/^[\*\-]\s+(.+)/);
      if (bulletListMatch) {
        return (
          <div key={index} className="flex items-start ml-3 mt-1.5">
            <span className="mr-2 text-primary dark:text-primary-foreground">•</span>
            <span>{bulletListMatch[1]}</span>
          </div>
        );
      }
      
      // Regular paragraph
      return line.trim() ? <p key={index} className={index > 0 ? "mt-2.5" : ""}>{line}</p> : null;
    });
  };

  return (
    <div className={`flex items-start ${isUser ? "flex-row-reverse" : ""} mb-5`}>
      {/* Avatar */}
      <motion.div 
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg ${
          isUser 
            ? "ml-2 bg-gradient-to-br from-primary to-blue-500 shadow-glow" 
            : "mr-2 bg-gradient-to-br from-accent to-secondary shadow-glow"
        } flex-shrink-0`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <motion.i 
          className={isUser ? "ri-user-fill" : "ri-restaurant-2-fill text-lg"}
          initial={{ rotate: -30 }}
          animate={{ rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        ></motion.i>
      </motion.div>

      {/* Message Bubble */}
      <motion.div 
        className={`${
          isUser 
            ? "chat-bubble-user glass shadow-lg px-4 py-3 border border-white/10 dark:border-slate-700/20" 
            : "chat-bubble-assistant glass shadow-lg px-4 py-3 border border-white/10 dark:border-slate-700/20"
        } max-w-[80%] text-sm relative`}
        initial={{ 
          opacity: 0, 
          x: isUser ? 20 : -20,
          scale: 0.95
        }}
        animate={{ 
          opacity: 1, 
          x: 0,
          scale: 1
        }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 20,
          delay: 0.1 
        }}
      >
        <div className="message-content">
          {formatContent(content)}
        </div>
        <div className="text-xs opacity-70 mt-1.5 text-right font-light">
          {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </motion.div>
    </div>
  );
};

export default ChatMessage;
