import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from './ui/button';
import exampleImage from 'figma:asset/6583c83d3c49f3f31a1df70c0162cc8d0154b526.png';

interface MindfullWelcomeScreenProps {
  onContinue: () => void;
}

export function MindfullWelcomeScreen({ onContinue }: MindfullWelcomeScreenProps) {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background">
      {/* Header with Settings */}
      <div className="flex justify-end p-4">
        <Button variant="ghost" size="icon">
          <Settings className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-8">
        {/* Welcome Text */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl">
            Welcome, <span className="text-blue-500">User</span>!
          </h1>
          <p className="text-lg text-muted-foreground">
            Get your life together
          </p>
        </div>

        {/* Chef Cat Image */}
        <div className="w-full max-w-xs">
          <div className="aspect-[3/4] bg-gradient-to-b from-orange-100 to-orange-200 rounded-2xl overflow-hidden">
            <img 
              src={exampleImage} 
              alt="Chef cat with cooking gloves" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Get Started Button */}
        <Button 
          onClick={onContinue}
          className="w-full max-w-xs bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl"
          size="lg"
        >
          Get Started
        </Button>
      </div>

      {/* Bottom Navigation Preview */}
      <div className="flex border-t bg-card">
        <div className="flex-1 flex flex-col items-center justify-center py-3 space-y-1">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <span className="text-xs text-muted-foreground">Home</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-3 space-y-1">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <span className="text-xs text-muted-foreground">Meds</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-3 space-y-1">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <span className="text-xs text-muted-foreground">Meals</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-3 space-y-1">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <span className="text-xs text-muted-foreground">Focus</span>
        </div>
      </div>
    </div>
  );
}