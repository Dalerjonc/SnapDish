import React from 'react';
import { cn } from '@/lib/utils';

interface NutritionDisplayProps {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  className?: string;
}

const NutritionDisplay = ({ calories, protein, carbs, fat, className }: NutritionDisplayProps) => {
  // Parse nutrition values removing the 'g' suffix
  const proteinValue = parseFloat(protein.replace('g', ''));
  const carbsValue = parseFloat(carbs.replace('g', ''));
  const fatValue = parseFloat(fat.replace('g', ''));
  
  // Calculate total macros for percentages
  const totalMacros = proteinValue + carbsValue + fatValue;
  
  // Calculate percentages
  const proteinPercent = Math.round((proteinValue / totalMacros) * 100);
  const carbsPercent = Math.round((carbsValue / totalMacros) * 100);
  const fatPercent = Math.round((fatValue / totalMacros) * 100);
  
  return (
    <div className={cn("flex flex-col items-center w-full max-w-md mx-auto", className)}>
      <h3 className="text-lg font-semibold mb-2">Nutrition Per Serving</h3>
      
      <div className="relative w-24 h-24 mb-4">
        {/* Circle progress indicator */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="none" 
            stroke="#e6e6e6" 
            strokeWidth="10" 
          />
          
          {/* Protein segment (purple) */}
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="none" 
            stroke="#6b21a8" 
            strokeWidth="10" 
            strokeDasharray={`${(proteinPercent / 100) * 251.2} 251.2`}
            strokeDashoffset="0"
            transform="rotate(-90 50 50)"
          />
          
          {/* Carbs segment (blue) */}
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="none" 
            stroke="#2563eb" 
            strokeWidth="10" 
            strokeDasharray={`${(carbsPercent / 100) * 251.2} 251.2`}
            strokeDashoffset={`${(1 - proteinPercent / 100) * 251.2}`}
            transform="rotate(-90 50 50)"
          />
          
          {/* Fat segment (orange) */}
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="none" 
            stroke="#ea580c" 
            strokeWidth="10" 
            strokeDasharray={`${(fatPercent / 100) * 251.2} 251.2`}
            strokeDashoffset={`${(1 - (proteinPercent + carbsPercent) / 100) * 251.2}`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        
        {/* Calories in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold">{calories}</span>
          <span className="text-xs text-gray-500">kcal</span>
        </div>
      </div>
      
      {/* Macronutrient breakdown */}
      <div className="flex justify-between w-full max-w-xs">
        <div className="flex flex-col items-center text-center">
          <div className="text-blue-600 font-semibold">{carbsPercent}%</div>
          <div className="font-semibold">{carbs}</div>
          <div className="text-xs text-gray-500">Carbs</div>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <div className="text-orange-600 font-semibold">{fatPercent}%</div>
          <div className="font-semibold">{fat}</div>
          <div className="text-xs text-gray-500">Fat</div>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <div className="text-purple-800 font-semibold">{proteinPercent}%</div>
          <div className="font-semibold">{protein}</div>
          <div className="text-xs text-gray-500">Protein</div>
        </div>
      </div>
    </div>
  );
};

export default NutritionDisplay;