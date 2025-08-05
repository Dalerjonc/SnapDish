import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTheme } from "next-themes";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getHistoryFromStorage, clearHistory as clearHistoryUtil } from "@shared/historyUtils";

// User preference types
type DietaryRestriction = 'none' | 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'keto';
type CookingSkillLevel = 'beginner' | 'intermediate' | 'advanced';
type MeasurementUnit = 'metric' | 'imperial';

const Profile = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // State for user metrics
  const [savedRecipes, setSavedRecipes] = useState<number>(0);
  
  // State for preferences
  const [dietaryRestriction, setDietaryRestriction] = useState<DietaryRestriction>('none');
  const [cookingSkill, setCookingSkill] = useState<CookingSkillLevel>('beginner');
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('metric');
  const [darkMode, setDarkMode] = useState(false);
  
  // State for dialogs
  const [dietaryDialogOpen, setDietaryDialogOpen] = useState(false);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  
  // State for notification settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [recipeRecommendations, setRecipeRecommendations] = useState(true);
  const [cookingReminders, setCookingReminders] = useState(false);
  
  // State for account settings
  const [username, setUsername] = useState('Chef User');
  const [email, setEmail] = useState('user@snapdish.com');
  
  // State for history
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [cookingHistory, setCookingHistory] = useState<any[]>([]);
  
  // Load user preferences from localStorage
  useEffect(() => {
    // Load dietary restrictions
    const savedDietaryRestrictions = localStorage.getItem('dietaryRestriction');
    if (savedDietaryRestrictions) {
      setDietaryRestriction(savedDietaryRestrictions as DietaryRestriction);
    }
    
    // Load cooking skill level
    const savedCookingSkill = localStorage.getItem('cookingSkill');
    if (savedCookingSkill) {
      setCookingSkill(savedCookingSkill as CookingSkillLevel);
    }
    
    // Load measurement unit
    const savedMeasurementUnit = localStorage.getItem('measurementUnit');
    if (savedMeasurementUnit) {
      setMeasurementUnit(savedMeasurementUnit as MeasurementUnit);
    }
    
    // Load saved recipes count
    const savedRecipesCount = localStorage.getItem('savedRecipesCount');
    if (savedRecipesCount) {
      setSavedRecipes(parseInt(savedRecipesCount, 10));
    }
    
    // Load notification settings
    const savedPushNotifications = localStorage.getItem('pushNotifications');
    if (savedPushNotifications !== null) {
      setPushNotifications(savedPushNotifications === 'true');
    }
    
    const savedEmailNotifications = localStorage.getItem('emailNotifications');
    if (savedEmailNotifications !== null) {
      setEmailNotifications(savedEmailNotifications === 'true');
    }
    
    const savedRecipeRecommendations = localStorage.getItem('recipeRecommendations');
    if (savedRecipeRecommendations !== null) {
      setRecipeRecommendations(savedRecipeRecommendations === 'true');
    }
    
    const savedCookingReminders = localStorage.getItem('cookingReminders');
    if (savedCookingReminders !== null) {
      setCookingReminders(savedCookingReminders === 'true');
    }
    
    // Load account settings
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
    
    const savedEmail = localStorage.getItem('email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
    
    // Load cooking history using utility
    setCookingHistory(getHistoryFromStorage());
  }, []);
  
  // Initialize theme state
  useEffect(() => {
    setMounted(true);
    setDarkMode(theme === 'dark');
  }, [theme]);
  
  // Toggle dark mode
  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    setTheme(enabled ? 'dark' : 'light');
    // Save to localStorage
    localStorage.setItem('theme', enabled ? 'dark' : 'light');
    
    toast({
      title: enabled ? "Dark mode enabled" : "Light mode enabled",
      description: `Theme preference has been saved.`,
    });
  };
  
  // Function to handle saving preferences
  const saveDietaryPreference = (value: DietaryRestriction) => {
    setDietaryRestriction(value);
    setDietaryDialogOpen(false);
    // Save to localStorage
    localStorage.setItem('dietaryRestriction', value);
    toast({
      title: "Preferences updated",
      description: "Your dietary preferences have been saved.",
    });
  };
  
  const saveCookingSkill = (value: CookingSkillLevel) => {
    setCookingSkill(value);
    setSkillDialogOpen(false);
    // Save to localStorage
    localStorage.setItem('cookingSkill', value);
    toast({
      title: "Preferences updated",
      description: "Your cooking skill level has been saved.",
    });
  };
  
  const saveMeasurementUnit = (value: MeasurementUnit) => {
    setMeasurementUnit(value);
    setUnitDialogOpen(false);
    // Save to localStorage
    localStorage.setItem('measurementUnit', value);
    toast({
      title: "Preferences updated",
      description: "Your measurement unit preference has been saved.",
    });
  };
  
  // Function to handle navigation to saved recipes
  const goToSavedRecipes = () => {
    // Demo function to simulate saved recipes
    let count = parseInt(localStorage.getItem('savedRecipesCount') || '0', 10);
    count++; // Increment count to simulate saving a recipe
    localStorage.setItem('savedRecipesCount', count.toString());
    setSavedRecipes(count);
    
    toast({
      title: `${count} Saved ${count === 1 ? 'Recipe' : 'Recipes'}`,
      description: "Your saved recipes are now available.",
    });
  };
  
  // Function to handle navigation to meal plans
  const goToMealPlans = () => {
    // Simulate meal plan creation
    toast({
      title: "Meal plan created",
      description: "A new weekly meal plan has been generated based on your preferences.",
    });
    
    // In a full implementation, this would navigate to a meal plans page
    setTimeout(() => {
      navigate('/');
      // After returning to home, show a follow-up toast
      setTimeout(() => {
        toast({
          title: "Shopping list ready",
          description: "We've prepared a shopping list for your new meal plan.",
        });
      }, 2000);
    }, 1500);
  };
  
  // Functions to save notification settings
  const saveNotificationSettings = () => {
    localStorage.setItem('pushNotifications', pushNotifications.toString());
    localStorage.setItem('emailNotifications', emailNotifications.toString());
    localStorage.setItem('recipeRecommendations', recipeRecommendations.toString());
    localStorage.setItem('cookingReminders', cookingReminders.toString());
    
    setNotificationDialogOpen(false);
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated.",
    });
  };
  
  // Functions to save account settings
  const saveAccountSettings = () => {
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    
    setAccountDialogOpen(false);
    toast({
      title: "Account settings saved",
      description: "Your account information has been updated.",
    });
  };
  
  // Function to clear cooking history
  const clearHistory = () => {
    clearHistoryUtil();
    setCookingHistory([]);
    setHistoryDialogOpen(false);
    toast({
      title: "History cleared",
      description: "Your cooking history has been cleared.",
    });
  };
  
  // Function to view recipe from history
  const viewRecipeFromHistory = (historyItem: any) => {
    setHistoryDialogOpen(false);
    // Navigate to recipe detail page with full recipe data available offline
    navigate(`/recipe/${historyItem.id}?name=${encodeURIComponent(historyItem.name)}&fromHistory=true`);
  };

  // Function to handle logout
  const handleLogout = () => {
    // Reset preferences to defaults
    setDietaryRestriction('none');
    setCookingSkill('beginner');
    setMeasurementUnit('metric');
    setSavedRecipes(0);
    
    // Clear stored preferences from localStorage
    localStorage.removeItem('dietaryRestriction');
    localStorage.removeItem('cookingSkill');
    localStorage.removeItem('measurementUnit');
    localStorage.removeItem('savedRecipesCount');
    
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
      <Card className="p-6 mb-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-primary/20 dark:bg-primary/40 rounded-full flex items-center justify-center">
            <i className="ri-user-3-line text-primary text-3xl"></i>
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold">Guest User</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Joined May 2025</p>
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
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription className="dark:text-neutral-400">
              Update your profile information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <input 
                id="name" 
                className="flex h-10 w-full rounded-md border border-input bg-background dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
                placeholder="Guest User" 
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <input 
                id="email" 
                className="flex h-10 w-full rounded-md border border-input bg-background dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
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
          className="p-4 text-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors dark:bg-gray-800 dark:border-gray-700"
          onClick={goToSavedRecipes}
        >
          <div className="text-2xl font-bold text-primary mb-1">{savedRecipes}</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">Saved Recipes</div>
        </Card>
        <Card 
          className="p-4 text-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors dark:bg-gray-800 dark:border-gray-700"
          onClick={goToMealPlans}
        >
          <div className="text-2xl font-bold text-secondary mb-1">0</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">Meal Plans</div>
        </Card>
      </div>
      
      {/* Preferences */}
      <h2 className="text-lg font-semibold mb-3">Preferences</h2>
      <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
        <div 
          className="p-4 border-b dark:border-gray-700 flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          onClick={() => setDietaryDialogOpen(true)}
        >
          <div>
            <div className="font-medium">Dietary Restrictions</div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              {dietaryRestriction === 'none' ? 'Set your dietary preferences' : 
               `Current: ${dietaryRestriction.charAt(0).toUpperCase() + dietaryRestriction.slice(1)}`}
            </div>
          </div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
        
        {/* Dietary Restrictions Dialog */}
        <Dialog open={dietaryDialogOpen} onOpenChange={setDietaryDialogOpen}>
          <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle>Dietary Restrictions</DialogTitle>
              <DialogDescription className="dark:text-neutral-400">
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
                <Label htmlFor="none" className="dark:text-white">None</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vegetarian" id="vegetarian" />
                <Label htmlFor="vegetarian" className="dark:text-white">Vegetarian</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vegan" id="vegan" />
                <Label htmlFor="vegan" className="dark:text-white">Vegan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gluten-free" id="gluten-free" />
                <Label htmlFor="gluten-free" className="dark:text-white">Gluten-Free</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dairy-free" id="dairy-free" />
                <Label htmlFor="dairy-free" className="dark:text-white">Dairy-Free</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="keto" id="keto" />
                <Label htmlFor="keto" className="dark:text-white">Keto</Label>
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
          className="p-4 border-b dark:border-gray-700 flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          onClick={() => setSkillDialogOpen(true)}
        >
          <div>
            <div className="font-medium">Cooking Skill Level</div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              {cookingSkill === 'beginner' ? 'Set your cooking expertise' : 
               `Current: ${cookingSkill.charAt(0).toUpperCase() + cookingSkill.slice(1)}`}
            </div>
          </div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
        
        {/* Cooking Skill Level Dialog */}
        <Dialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen}>
          <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle>Cooking Skill Level</DialogTitle>
              <DialogDescription className="dark:text-neutral-400">
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
                <Label htmlFor="beginner" className="dark:text-white">Beginner</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate" className="dark:text-white">Intermediate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced" className="dark:text-white">Advanced</Label>
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
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          onClick={() => setUnitDialogOpen(true)}
        >
          <div>
            <div className="font-medium">Measurement Units</div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Current: {measurementUnit === 'metric' ? 'Metric' : 'Imperial'}
            </div>
          </div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
        
        {/* Measurement Units Dialog */}
        <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
          <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle>Measurement Units</DialogTitle>
              <DialogDescription className="dark:text-neutral-400">
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
                <Label htmlFor="metric" className="dark:text-white">Metric (g, ml, °C)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="imperial" id="imperial" />
                <Label htmlFor="imperial" className="dark:text-white">Imperial (oz, cups, °F)</Label>
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
      
      {/* History */}
      <h2 className="text-lg font-semibold mb-3">History</h2>
      <Card className="mb-6">
        <div 
          className="p-4 border-b flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          onClick={() => setHistoryDialogOpen(true)}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center bg-primary/20 text-primary rounded-full mr-3">
              <i className="ri-history-line text-lg"></i>
            </div>
            <div>
              <div className="font-medium">Cooking History</div>
              <p className="text-xs text-neutral-600">{cookingHistory.length} items saved</p>
            </div>
          </div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
      </Card>

      {/* Settings */}
      <h2 className="text-lg font-semibold mb-3">Settings</h2>
      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-medium">Dark Mode</div>
          <Switch 
            checked={darkMode}
            onCheckedChange={toggleDarkMode}
          />
        </div>
        <div 
          className="p-4 border-b flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          onClick={() => setNotificationDialogOpen(true)}
        >
          <div className="font-medium">Notifications</div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
        <div 
          className="p-4 border-b flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          onClick={() => setAccountDialogOpen(true)}
        >
          <div className="font-medium">Account Settings</div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
        <div 
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          onClick={handleLogout}
        >
          <div className="font-medium text-red-500">Log Out</div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
      </Card>
      
      {/* Notification Settings Dialog */}
      <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>
              Manage your notification preferences to get the alerts you want.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="text-sm font-medium">
                Push Notifications
              </Label>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="text-sm font-medium">
                Email Notifications
              </Label>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="recipe-recommendations" className="text-sm font-medium">
                Recipe Recommendations
              </Label>
              <Switch
                id="recipe-recommendations"
                checked={recipeRecommendations}
                onCheckedChange={setRecipeRecommendations}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="cooking-reminders" className="text-sm font-medium">
                Cooking Reminders
              </Label>
              <Switch
                id="cooking-reminders"
                checked={cookingReminders}
                onCheckedChange={setCookingReminders}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={saveNotificationSettings} className="w-full">
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Account Settings Dialog */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
            <DialogDescription>
              Update your account information and preferences.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={saveAccountSettings} className="w-full">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cooking History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Cooking History</DialogTitle>
            <DialogDescription>
              Your saved dishes and recipes. Accessible offline anytime.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            {cookingHistory.length === 0 ? (
              <div className="text-center py-8">
                <i className="ri-history-line text-4xl text-neutral-300 mb-3"></i>
                <p className="text-neutral-500 mb-2">No cooking history yet</p>
                <p className="text-sm text-neutral-400">Start identifying dishes or finding recipes to build your history!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cookingHistory.map((item, index) => (
                  <div 
                    key={index}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    onClick={() => viewRecipeFromHistory(item)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-neutral-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <i className="ri-restaurant-line text-neutral-400"></i>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-neutral-500">
                          {item.source === 'identify' ? 'Dish Identified' : 'From Ingredients'} • {item.date}
                        </p>
                      </div>
                      <i className="ri-arrow-right-s-line text-neutral-400"></i>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex-shrink-0">
            <div className="flex w-full gap-2">
              <Button variant="outline" onClick={() => setHistoryDialogOpen(false)} className="flex-1">
                Close
              </Button>
              {cookingHistory.length > 0 && (
                <Button variant="destructive" onClick={clearHistory} className="flex-1">
                  Clear History
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;