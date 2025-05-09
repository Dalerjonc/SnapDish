import React from 'react';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  delay?: number;
}

const FloatingCard: React.FC<FloatingCardProps> = ({ 
  children, 
  className = "", 
  hoverEffect = true,
  delay = 0
}) => {
  const floatStyle = {
    animationDelay: `${delay}s`
  };

  return (
    <div 
      className={`glass-card floating-card ${hoverEffect ? 'hover:shadow-xl transition-shadow duration-300' : ''} ${className}`}
      style={floatStyle}
    >
      {children}
    </div>
  );
};

export default FloatingCard;