import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  location: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, location }) => {
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  
  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);
  
  // This is where we'd handle the transition timing
  const handleAnimationEnd = () => {
    if (transitionStage === 'fadeOut') {
      setTransitionStage('fadeIn');
      setDisplayLocation(location);
    }
  };
  
  return (
    <div className="page-transition" onAnimationEnd={handleAnimationEnd}>
      <div className={`transition-content ${transitionStage}`}>
        {children}
      </div>
    </div>
  );
};

// Implementation with Framer Motion
const MotionPageTransition: React.FC<PageTransitionProps> = ({ children, location }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default MotionPageTransition;