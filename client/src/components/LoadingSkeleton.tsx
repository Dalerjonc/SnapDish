import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  message?: string;
  type?: 'card' | 'list' | 'search';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  message = "Searching...", 
  type = 'list',
  count = 3
}) => {
  const shimmerAnimation = {
    hidden: { 
      opacity: 0.5,
      x: '-100%' 
    },
    visible: { 
      opacity: 1,
      x: '100%',
      transition: {
        repeat: Infinity,
        repeatType: "loop" as const,
        duration: 1.5,
        ease: "linear"
      }
    }
  };
  
  // Render skeleton cards
  const renderCards = () => {
    return Array(count).fill(0).map((_, i) => (
      <div key={i} className="flex gap-4 items-center bg-white/40 dark:bg-slate-800/40 rounded-xl p-4 mb-4">
        <div className="w-24 h-24 bg-neutral-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-5 bg-neutral-200 dark:bg-slate-700 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-neutral-200 dark:bg-slate-700 rounded mb-2 w-1/2"></div>
          <div className="h-4 bg-neutral-200 dark:bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
    ));
  };
  
  // Render skeleton list items
  const renderList = () => {
    return Array(count).fill(0).map((_, i) => (
      <div key={i} className="flex gap-4 items-center bg-white/40 dark:bg-slate-800/40 rounded-xl p-3 mb-3">
        <div className="w-16 h-16 bg-neutral-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-4 bg-neutral-200 dark:bg-slate-700 rounded mb-2 w-3/4"></div>
          <div className="h-3 bg-neutral-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    ));
  };
  
  // Render search loading
  const renderSearch = () => {
    return (
      <div>
        <motion.div 
          className="bg-primary/20 text-primary-foreground p-3 rounded-full text-center mb-4"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.div>
        {renderList()}
      </div>
    );
  };
  
  return (
    <div className="relative overflow-hidden">
      {type === 'card' && renderCards()}
      {type === 'list' && renderList()}
      {type === 'search' && renderSearch()}
      
      {/* Add shimmer effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full"
        variants={shimmerAnimation}
        initial="hidden"
        animate="visible"
      />
    </div>
  );
};

export default LoadingSkeleton;