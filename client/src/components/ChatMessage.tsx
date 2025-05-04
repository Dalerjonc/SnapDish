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
    <div className={`flex items-start ${isUser ? "flex-row-reverse" : ""}`}>
      <div 
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
          isUser ? "ml-2 bg-primary" : "mr-2 bg-secondary"
        } flex-shrink-0`}
      >
        <i className={isUser ? "ri-user-line" : "ri-robot-line"}></i>
      </div>
      <div 
        className={`${
          isUser 
            ? "chat-bubble-user bg-secondary text-white" 
            : "chat-bubble bg-neutral-100"
        } px-4 py-3 max-w-[80%] text-sm relative`}
      >
        {formatContent(content)}
      </div>
    </div>
  );
};

export default ChatMessage;
