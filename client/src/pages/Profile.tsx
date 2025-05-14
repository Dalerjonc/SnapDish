import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// User preference types
type DietaryRestriction = 'none' | 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'keto';
type CookingSkillLevel = 'beginner' | 'intermediate' | 'advanced';
type MeasurementUnit = 'metric' | 'imperial';

const Profile = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // State for user metrics
  const [savedRecipes, setSavedRecipes] = useState<number>(0);
  
  // State for preferences
  const [dietaryRestriction, setDietaryRestriction] = useState<DietaryRestriction>('none');
  const [cookingSkill, setCookingSkill] = useState<CookingSkillLevel>('beginner');
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('metric');
  
  // State for dialogs
  const [dietaryDialogOpen, setDietaryDialogOpen] = useState(false);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  
  // Function to handle saving preferences
  const saveDietaryPreference = (value: DietaryRestriction) => {
    setDietaryRestriction(value);
    setDietaryDialogOpen(false);
    toast({
      title: "Preferences updated",
      description: "Your dietary preferences have been saved.",
    });
  };
  
  const saveCookingSkill = (value: CookingSkillLevel) => {
    setCookingSkill(value);
    setSkillDialogOpen(false);
    toast({
      title: "Preferences updated",
      description: "Your cooking skill level has been saved.",
    });
  };
  
  const saveMeasurementUnit = (value: MeasurementUnit) => {
    setMeasurementUnit(value);
    setUnitDialogOpen(false);
    toast({
      title: "Preferences updated",
      description: "Your measurement unit preference has been saved.",
    });
  };
  
  // Function to handle navigation to saved recipes
  const goToSavedRecipes = () => {
    // This would navigate to a saved recipes page
    toast({
      title: "Coming soon",
      description: "Saved recipes feature is under development.",
    });
  };
  
  // Function to handle navigation to meal plans
  const goToMealPlans = () => {
    // This would navigate to a meal plans page
    toast({
      title: "Coming soon",
      description: "Meal plans feature is under development.",
    });
  };
  
  // Function to handle logout
  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    // Navigate back to home after logout
    setTimeout(() => navigate("/"), 500);
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-center">My Profile</h1>
      
      {/* User Info Card */}
      <Card className="p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <i className="ri-user-3-line text-primary text-3xl"></i>
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold">Guest User</h2>
            <p className="text-sm text-neutral-500">Joined May 2025</p>
          </div>
        </div>
        
        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => setProfileDialogOpen(true)}
        >
          Edit Profile
        </Button>
      </Card>
      
      {/* Profile Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <input 
                id="name" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Guest User" 
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <input 
                id="email" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="email@example.com" 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => {
                setProfileDialogOpen(false);
                toast({
                  title: "Profile updated",
                  description: "Your profile information has been saved.",
                });
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card 
          className="p-4 text-center cursor-pointer hover:bg-neutral-50 transition-colors"
          onClick={goToSavedRecipes}
        >
          <div className="text-2xl font-bold text-primary mb-1">{savedRecipes}</div>
          <div className="text-sm text-neutral-500">Saved Recipes</div>
        </Card>
        <Card 
          className="p-4 text-center cursor-pointer hover:bg-neutral-50 transition-colors"
          onClick={goToMealPlans}
        >
          <div className="text-2xl font-bold text-secondary mb-1">0</div>
          <div className="text-sm text-neutral-500">Meal Plans</div>
        </Card>
      </div>
      
      {/* Preferences */}
      <h2 className="text-lg font-semibold mb-3">Preferences</h2>
      <Card className="mb-6">
        <div 
          className="p-4 border-b flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
          onClick={() => setDietaryDialogOpen(true)}
        >
          <div>
            <div className="font-medium">Dietary Restrictions</div>
            <div className="text-sm text-neutral-500">
              {dietaryRestriction === 'none' ? 'Set your dietary preferences' : 
               `Current: ${dietaryRestriction.charAt(0).toUpperCase() + dietaryRestriction.slice(1)}`}
            </div>
          </div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
        
        {/* Dietary Restrictions Dialog */}
        <Dialog open={dietaryDialogOpen} onOpenChange={setDietaryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dietary Restrictions</DialogTitle>
              <DialogDescription>
                Select your dietary preferences to get personalized recipes.
              </DialogDescription>
            </DialogHeader>
            
            <RadioGroup 
              value={dietaryRestriction}
              onValueChange={(value) => setDietaryRestriction(value as DietaryRestriction)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none">None</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vegetarian" id="vegetarian" />
                <Label htmlFor="vegetarian">Vegetarian</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vegan" id="vegan" />
                <Label htmlFor="vegan">Vegan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gluten-free" id="gluten-free" />
                <Label htmlFor="gluten-free">Gluten-Free</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dairy-free" id="dairy-free" />
                <Label htmlFor="dairy-free">Dairy-Free</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="keto" id="keto" />
                <Label htmlFor="keto">Keto</Label>
              </div>
            </RadioGroup>
            
            <DialogFooter>
              <Button onClick={() => saveDietaryPreference(dietaryRestriction)}>
                Save Preferences
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div 
          className="p-4 border-b flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
          onClick={() => setSkillDialogOpen(true)}
        >
          <div>
            <div className="font-medium">Cooking Skill Level</div>
            <div className="text-sm text-neutral-500">
              {cookingSkill === 'beginner' ? 'Set your cooking expertise' : 
               `Current: ${cookingSkill.charAt(0).toUpperCase() + cookingSkill.slice(1)}`}
            </div>
          </div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
        
        {/* Cooking Skill Level Dialog */}
        <Dialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cooking Skill Level</DialogTitle>
              <DialogDescription>
                Select your cooking expertise level to get appropriate recipes.
              </DialogDescription>
            </DialogHeader>
            
            <RadioGroup 
              value={cookingSkill}
              onValueChange={(value) => setCookingSkill(value as CookingSkillLevel)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="beginner" />
                <Label htmlFor="beginner">Beginner</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate">Intermediate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced">Advanced</Label>
              </div>
            </RadioGroup>
            
            <DialogFooter>
              <Button onClick={() => saveCookingSkill(cookingSkill)}>
                Save Skill Level
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div 
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
          onClick={() => setUnitDialogOpen(true)}
        >
          <div>
            <div className="font-medium">Measurement Units</div>
            <div className="text-sm text-neutral-500">
              Current: {measurementUnit === 'metric' ? 'Metric' : 'Imperial'}
            </div>
          </div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
        
        {/* Measurement Units Dialog */}
        <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Measurement Units</DialogTitle>
              <DialogDescription>
                Choose your preferred measurement system for recipes.
              </DialogDescription>
            </DialogHeader>
            
            <RadioGroup 
              value={measurementUnit}
              onValueChange={(value) => setMeasurementUnit(value as MeasurementUnit)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="metric" id="metric" />
                <Label htmlFor="metric">Metric (g, ml, °C)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="imperial" id="imperial" />
                <Label htmlFor="imperial">Imperial (oz, cups, °F)</Label>
              </div>
            </RadioGroup>
            
            <DialogFooter>
              <Button onClick={() => saveMeasurementUnit(measurementUnit)}>
                Save Preference
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
      
      {/* Settings */}
      <h2 className="text-lg font-semibold mb-3">Settings</h2>
      <Card>
        <div 
          className="p-4 border-b flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
          onClick={() => {
            toast({
              title: "Coming soon",
              description: "Notification settings will be available in a future update.",
            });
          }}
        >
          <div className="font-medium">Notifications</div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
        <div 
          className="p-4 border-b flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
          onClick={() => {
            toast({
              title: "Coming soon",
              description: "Account settings will be available in a future update.",
            });
          }}
        >
          <div className="font-medium">Account Settings</div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
        <div 
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
          onClick={handleLogout}
        >
          <div className="font-medium text-red-500">Log Out</div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
      </Card>
    </div>
  );
};

export default Profile;