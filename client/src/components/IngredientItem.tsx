import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface IngredientItemProps {
  name: string;
  amount?: number;
  unit?: string;
  original?: string;
}

const IngredientItem = ({ name, amount, unit, original }: IngredientItemProps) => {
  const [checked, setChecked] = useState(false);
  
  const displayText = original || (amount && unit) 
    ? `${amount} ${unit} ${name}`.trim() 
    : name;

  return (
    <li className="flex items-start">
      <Checkbox 
        id={`ingredient-${name}`} 
        checked={checked} 
        onCheckedChange={(value) => setChecked(!!value)} 
        className="h-6 w-6 rounded-md border border-neutral-300 mr-3 mt-0.5 flex-shrink-0"
      />
      <span className={checked ? "line-through text-neutral-400" : ""}>{displayText}</span>
    </li>
  );
};

export default IngredientItem;
