import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';

interface AnimatedButtonProps extends ButtonProps {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className = "",
  iconLeft,
  iconRight,
  ...props
}) => {
  return (
    <Button 
      className={`rounded-md ${className}`}
      {...props}
    >
      {iconLeft && (
        <span className="mr-2">
          {iconLeft}
        </span>
      )}
      <span>{children}</span>
      {iconRight && (
        <span className="ml-2">
          {iconRight}
        </span>
      )}
    </Button>
  );
};

export default AnimatedButton;