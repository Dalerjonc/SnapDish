import React from 'react';

interface TypingIndicatorProps {
  label?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ label = "Chef is thinking" }) => {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="glass px-5 py-3 rounded-full flex items-center animate-pulse">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-3">
          <i className="ri-robot-line text-white"></i>
        </div>
        <span className="mr-2 text-sm font-medium">{label}</span>
        <div className="typing-indicator">
          <div className="typing-indicator-dot"></div>
          <div className="typing-indicator-dot"></div>
          <div className="typing-indicator-dot"></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;