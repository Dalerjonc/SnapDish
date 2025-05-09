import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface AnimatedButtonProps extends ButtonProps {
  gradient?: boolean;
  glowEffect?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  animationType?: 'scale' | 'pulse' | 'bounce' | 'none';
  glassEffect?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className = "",
  gradient = true,
  glowEffect = false,
  iconLeft,
  iconRight,
  animationType = 'scale',
  glassEffect = false,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  
  // Define iOS-style background gradient
  const gradientClass = gradient 
    ? 'bg-gradient-to-br from-primary via-purple-500 to-blue-500 text-white' 
    : '';
    
  // Apply glass effect if specified
  const glassClass = glassEffect 
    ? 'backdrop-blur-md bg-white/30 dark:bg-slate-900/30 border border-white/30 dark:border-slate-700/30' 
    : '';
    
  // Apply glow effect if specified
  const glowClass = glowEffect 
    ? 'shadow-glow' 
    : 'shadow-lg';
    
  // Define animation variants
  const getAnimationProps = () => {
    switch (animationType) {
      case 'scale':
        return {
          whileTap: { scale: 0.95 },
          whileHover: { scale: 1.02 }
        };
      case 'pulse':
        return {
          animate: {
            scale: isPressed ? [1, 0.97, 1] : [1, 1.03, 1],
            transition: {
              duration: 2,
              repeat: Infinity,
              repeatType: 'loop'
            }
          }
        };
      case 'bounce':
        return {
          animate: {
            y: [0, -5, 0],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'loop'
            }
          }
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      className="inline-block"
      {...getAnimationProps()}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
    >
      <Button 
        className={`
          btn-3d-touch 
          ${gradientClass}
          ${glassClass}
          ${glowClass}
          ${glowEffect ? 'highlight-accent' : ''}
          rounded-3xl 
          ${className}
        `}
        {...props}
      >
        {iconLeft && (
          <motion.span 
            className="mr-2"
            animate={isPressed ? { rotate: -5 } : { rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
          >
            {iconLeft}
          </motion.span>
        )}
        <span>{children}</span>
        {iconRight && (
          <motion.span 
            className="ml-2"
            animate={isPressed ? { rotate: 5 } : { rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
          >
            {iconRight}
          </motion.span>
        )}
        
        {/* iOS-style shimmer effect */}
        {glowEffect && (
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute -inset-[100%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
        )}
      </Button>
    </motion.div>
  );
};

export default AnimatedButton;