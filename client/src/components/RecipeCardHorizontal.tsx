import { Link } from "wouter";

interface RecipeCardHorizontalProps {
  id: number | string;
  title: string;
  image: string;
  readyInMinutes: number;
  calories?: number;
  source?: 'ingredients' | 'history' | 'default';
}

const RecipeCardHorizontal = ({ id, title, image, readyInMinutes, calories, source = 'default' }: RecipeCardHorizontalProps) => {
  // Build URL with appropriate query parameters based on source
  const getRecipeUrl = () => {
    const baseUrl = `/recipe/${id}`;
    const params = new URLSearchParams();
    
    if (source === 'ingredients') {
      params.set('fromIngredients', 'true');
    } else if (source === 'history') {
      params.set('fromHistory', 'true');
    }
    
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  };

  return (
    <Link href={getRecipeUrl()}>
      <div className="flex bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-200 cursor-pointer">
        <div className="w-1/3 relative">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
        <div className="w-2/3 p-2">
          <h3 className="font-medium text-sm">{title}</h3>
          <div className="text-xs text-neutral-500 mt-1">
            <div className="flex items-center">
              <i className="ri-time-line mr-1"></i>
              <span>{readyInMinutes} min</span>
            </div>
            {calories && (
              <div className="flex items-center mt-1">
                <i className="ri-fire-line mr-1"></i>
                <span>{calories} cal</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCardHorizontal;
