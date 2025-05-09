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
    <div className={cn("flex flex-col w-full max-w-md mx-auto", className)}>
      <h3 className="text-lg font-semibold mb-2">Nutrition Per Serving</h3>
      
      {/* Calories display with horizontal line */}
      <div className="flex items-center mb-4">
        <div className="text-2xl font-bold mr-3">{calories}</div>
        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded-full w-full overflow-hidden flex">
            {/* Break down calories by macronutrient proportions */}
            <div 
              className="h-2 bg-blue-600" 
              style={{ width: `${carbsPercent}%` }}
            ></div>
            <div 
              className="h-2 bg-orange-600" 
              style={{ width: `${fatPercent}%` }}
            ></div>
            <div 
              className="h-2 bg-purple-800" 
              style={{ width: `${proteinPercent}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">calories</div>
        </div>
      </div>
      
      {/* Macronutrient breakdown */}
      <div className="flex justify-between w-full">
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