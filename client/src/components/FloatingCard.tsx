import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  delay?: number;
  depth?: 'low' | 'medium' | 'high';
  animationType?: 'float' | 'breathe' | 'none';
}

const FloatingCard: React.FC<FloatingCardProps> = ({ 
  children, 
  className = "", 
  hoverEffect = true,
  delay = 0,
  depth = 'medium',
  animationType = 'float'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Set shadow based on depth
  const shadowStyles = {
    low: 'shadow-md',
    medium: 'shadow-lg',
    high: 'shadow-xl'
  };

  // Animation settings
  const animationStyle = {
    animationDelay: `${delay}s`
  };

  // Define animations
  const floatAnimation = animationType === 'float' ? 'floating-card' : 
                         animationType === 'breathe' ? 'breathing-card' : '';
  
  // iOS-style transition
  const hoverTransition = {
    type: 'spring', 
    stiffness: 200, 
    damping: 20
  };

  return (
    <motion.div 
      className={`glass-card ${floatAnimation} ${shadowStyles[depth]} ${hoverEffect ? 'highlight-accent' : ''} ${className}`}
      style={animationStyle}
      whileHover={hoverEffect ? { 
        scale: 1.02, 
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.10), 0 6px 6px rgba(0, 0, 0, 0.07)' 
      } : {}}
      transition={hoverTransition}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* iOS-style inner shadow overlay */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-b from-white/10 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-50'}`}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default FloatingCard;