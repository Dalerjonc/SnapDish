import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { recipeService } from "@/lib/services";
import ImageUploader from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const IdentifyDish = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const identifyMutation = useMutation({
    mutationFn: (file: File) => recipeService.identifyDish(file),
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: `Identified: ${data.name}`,
      });
      navigate(`/recipe/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error identifying dish",
        description: error instanceof Error ? error.message : "Please try again with a clearer photo",
        variant: "destructive",
      });
    },
  });

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
  };

  const handleIdentify = () => {
    if (selectedImage) {
      identifyMutation.mutate(selectedImage);
    } else {
      toast({
        title: "No image selected",
        description: "Please take a photo or upload an image first",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="px-4 py-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold font-heading mb-2">Identify a Dish</h2>
        <p className="text-sm text-neutral-600">Take a photo of any cooked dish to get recipes and nutrition info</p>
      </div>

      {/* Camera / Upload Section */}
      <ImageUploader
        onImageSelect={handleImageSelect}
        title="Take a photo or upload an image"
        description="Works best with clear, well-lit photos of the dish"
        className="mb-6"
      />

      {selectedImage && (
        <Button 
          onClick={handleIdentify} 
          className="w-full bg-primary text-white font-medium py-3 rounded-lg mb-6"
          disabled={identifyMutation.isPending}
        >
          {identifyMutation.isPending ? (
            <>
              <i className="ri-loader-4-line animate-spin mr-2"></i>
              Identifying...
            </>
          ) : (
            <>
              <i className="ri-search-line mr-2"></i>
              Identify Dish
            </>
          )}
        </Button>
      )}

      {/* Examples Section */}
      <div>
        <h3 className="text-base font-semibold font-heading mb-3">Example Dish Identifications</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Example 1 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="aspect-square relative">
              <img 
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd" 
                alt="Mediterranean Salad" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="p-3">
              <h4 className="font-medium text-sm">Mediterranean Salad</h4>
              <p className="text-xs text-neutral-500 mt-1">415 calories | High protein</p>
            </div>
          </div>
          
          {/* Example 2 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="aspect-square relative">
              <img 
                src="https://images.unsplash.com/photo-1484723091739-30a097e8f929" 
                alt="Breakfast Toast" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="p-3">
              <h4 className="font-medium text-sm">Breakfast Toast</h4>
              <p className="text-xs text-neutral-500 mt-1">320 calories | Quick meal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentifyDish;
