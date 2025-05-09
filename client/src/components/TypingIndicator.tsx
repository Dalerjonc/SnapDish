import { motion } from "framer-motion";

interface TypingIndicatorProps {
  label?: string;
}

const TypingIndicator = ({ label = "AI is typing" }: TypingIndicatorProps) => {
  return (
    <div className="flex items-start">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white mr-2 flex-shrink-0 shadow-glow">
        <motion.i 
          className="ri-restaurant-2-line"
          animate={{ 
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1, 1.1, 1] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatType: "loop" 
          }}
        />
      </div>
      <div className="chat-bubble-assistant p-4 max-w-[80%] text-sm glass shadow-lg">
        <div className="flex flex-col space-y-2">
          <span className="text-xs text-foreground/70">{label}</span>
          <div className="flex space-x-2">
            <motion.div 
              className="h-2.5 w-2.5 bg-primary/50 rounded-full"
              animate={{ 
                y: [0, -5, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity,
                repeatType: "loop",
                delay: 0
              }}
            />
            <motion.div 
              className="h-2.5 w-2.5 bg-primary/60 rounded-full"
              animate={{ 
                y: [0, -5, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity,
                repeatType: "loop",
                delay: 0.2
              }}
            />
            <motion.div 
              className="h-2.5 w-2.5 bg-primary/70 rounded-full"
              animate={{ 
                y: [0, -5, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity,
                repeatType: "loop",
                delay: 0.4
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;