import { ChatMessage as ChatMessageType } from "@shared/schema";

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
          <div key={index} className="flex items-start ml-3 mt-1">
            <span className="mr-2 font-medium">{numberedListMatch[1]}.</span>
            <span>{numberedListMatch[2]}</span>
          </div>
        );
      }
      
      // Check if line is a bullet list item
      const bulletListMatch = line.match(/^[\*\-]\s+(.+)/);
      if (bulletListMatch) {
        return (
          <div key={index} className="flex items-start ml-3 mt-1">
            <span className="mr-2">•</span>
            <span>{bulletListMatch[1]}</span>
          </div>
        );
      }
      
      // Regular paragraph
      return line.trim() ? <p key={index} className={index > 0 ? "mt-2" : ""}>{line}</p> : null;
    });
  };

  return (
    <div className={`flex items-start ${isUser ? "flex-row-reverse" : ""} mb-4`}>
      <div 
        className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md ${
          isUser 
            ? "ml-2 bg-gradient-to-br from-primary to-secondary" 
            : "mr-2 bg-gradient-to-br from-accent to-secondary"
        } flex-shrink-0`}
      >
        <i className={isUser ? "ri-user-line" : "ri-robot-line"}></i>
      </div>
      <div 
        className={`${
          isUser 
            ? "chat-bubble-user" 
            : "chat-bubble"
        } max-w-[80%] text-sm relative`}
      >
        <div className="message-content">
          {formatContent(content)}
        </div>
        <div className="text-xs opacity-70 mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
