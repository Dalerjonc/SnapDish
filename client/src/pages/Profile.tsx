import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Profile = () => {
  const [savedRecipes, setSavedRecipes] = useState<number>(0);

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
        
        <Button className="w-full" variant="outline">
          Edit Profile
        </Button>
      </Card>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">{savedRecipes}</div>
          <div className="text-sm text-neutral-500">Saved Recipes</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-secondary mb-1">0</div>
          <div className="text-sm text-neutral-500">Meal Plans</div>
        </Card>
      </div>
      
      {/* Preferences */}
      <h2 className="text-lg font-semibold mb-3">Preferences</h2>
      <Card className="mb-6">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="font-medium">Dietary Restrictions</div>
            <div className="text-sm text-neutral-500">Set your dietary preferences</div>
          </div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="font-medium">Cooking Skill Level</div>
            <div className="text-sm text-neutral-500">Set your cooking expertise</div>
          </div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div>
            <div className="font-medium">Measurement Units</div>
            <div className="text-sm text-neutral-500">Choose metric or imperial</div>
          </div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
      </Card>
      
      {/* Settings */}
      <h2 className="text-lg font-semibold mb-3">Settings</h2>
      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-medium">Notifications</div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-medium">Account Settings</div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="font-medium text-red-500">Log Out</div>
          <i className="ri-arrow-right-s-line text-neutral-400"></i>
        </div>
      </Card>
    </div>
  );
};

export default Profile;