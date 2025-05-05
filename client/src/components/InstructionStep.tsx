import { useState } from "react";

interface InstructionStepProps {
  number: number;
  step: string;
  ingredients?: { id: number; name: string; image: string }[];
  equipment?: { id: number; name: string; image: string }[];
}

const InstructionStep = ({ number, step, ingredients, equipment }: InstructionStepProps) => {
  const [completed, setCompleted] = useState(false);
  
  // Clean up the step text by removing any leading numbers and formatting
  const cleanStep = typeof step === 'string' ? step.replace(/^\d+[\.\)\-]\s*/, '').trim() : 'No step information available';

  return (
    <li className="flex mb-4">
      <div 
        className={`${
          completed ? "bg-accent" : "bg-primary"
        } text-white w-7 h-7 rounded-full flex items-center justify-center font-medium mr-3 flex-shrink-0 mt-0.5 cursor-pointer`}
        onClick={() => setCompleted(!completed)}
      >
        {completed ? <i className="ri-check-line"></i> : number}
      </div>
      <div className={`${completed ? "text-neutral-400" : ""} flex-1`}>
        <p className="mb-1">{cleanStep}</p>
        
        {(ingredients && ingredients.length > 0) && (
          <div className="mt-1">
            <span className="text-xs font-medium text-neutral-500">Ingredients: </span>
            <span className="text-xs text-neutral-600">
              {ingredients.map(i => i.name).join(", ")}
            </span>
          </div>
        )}
        
        {(equipment && equipment.length > 0) && (
          <div className="mt-1">
            <span className="text-xs font-medium text-neutral-500">Equipment: </span>
            <span className="text-xs text-neutral-600">
              {equipment.map(e => e.name).join(", ")}
            </span>
          </div>
        )}
      </div>
    </li>
  );
};

export default InstructionStep;
