import { Link } from "wouter";

interface RecipeCardProps {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  difficulty?: string;
}

const RecipeCard = ({ id, title, image, readyInMinutes, difficulty = "Easy" }: RecipeCardProps) => {
  return (
    <Link href={`/recipe/${id}`}>
      <div className="snap-start min-w-[160px] max-w-[160px] rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-md transition duration-200 cursor-pointer">
        <div className="aspect-square relative">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
            <i className="ri-heart-line text-neutral-500 text-sm"></i>
          </div>
        </div>
        <div className="p-2">
          <h3 className="font-medium text-sm truncate">{title}</h3>
          <div className="flex items-center text-xs text-neutral-500 mt-1">
            <i className="ri-time-line mr-1"></i>
            <span>{readyInMinutes} min</span>
            <span className="mx-2">•</span>
            <span>{difficulty}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
