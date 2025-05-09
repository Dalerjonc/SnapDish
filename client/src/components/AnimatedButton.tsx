import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';

interface AnimatedButtonProps extends ButtonProps {
  gradient?: boolean;
  glowEffect?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className = "",
  gradient = true,
  glowEffect = true,
  iconLeft,
  iconRight,
  ...props
}) => {
  return (
    <Button 
      className={`
        btn-3d-touch 
        ${gradient ? 'bg-gradient-to-r from-primary to-secondary text-white' : ''}
        ${glowEffect ? 'highlight-accent' : ''}
        rounded-3xl py-6 
        shadow-lg
        ${className}
      `}
      {...props}
    >
      {iconLeft && <span className="mr-2">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-2">{iconRight}</span>}
    </Button>
  );
};

export default AnimatedButton;