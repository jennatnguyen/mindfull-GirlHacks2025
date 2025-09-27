import React, { useState } from 'react';
import { Home, Pill, Utensils, Brain, Heart, Settings, Clock, BookOpen } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { MindfullWelcomeScreen } from './components/MindfullWelcomeScreen';
import { MindfullMedicationScreen } from './components/MindfullMedicationScreen';
import { MindfullMealPlannerScreen } from './components/MindfullMealPlannerScreen';
import { MindfullFocusScreen } from './components/MindfullFocusScreen';
import { MindfullMindfulnessScreen } from './components/MindfullMindfulnessScreen';

type Screen = 'welcome' | 'home' | 'medication' | 'meals' | 'focus' | 'mindfulness';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [userName, setUserName] = useState('User');

  if (currentScreen === 'welcome') {
    return <MindfullWelcomeScreen onContinue={() => setCurrentScreen('home')} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen userName={userName} onNavigate={setCurrentScreen} />;
      case 'medication':
        return <MindfullMedicationScreen />;
      case 'meals':
        return <MindfullMealPlannerScreen />;
      case 'focus':
        return <MindfullFocusScreen />;
      case 'mindfulness':
        return <MindfullMindfulnessScreen />;
      default:
        return <HomeScreen userName={userName} onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">Mindfull</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentScreen('welcome')}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      <div className="flex border-t bg-card">
        <NavButton
          icon={<Home className="h-5 w-5" />}
          label="Home"
          active={currentScreen === 'home'}
          onClick={() => setCurrentScreen('home')}
        />
        <NavButton
          icon={<Pill className="h-5 w-5" />}
          label="Meds"
          active={currentScreen === 'medication'}
          onClick={() => setCurrentScreen('medication')}
        />
        <NavButton
          icon={<Utensils className="h-5 w-5" />}
          label="Meals"
          active={currentScreen === 'meals'}
          onClick={() => setCurrentScreen('meals')}
        />
        <NavButton
          icon={<Brain className="h-5 w-5" />}
          label="Focus"
          active={currentScreen === 'focus'}
          onClick={() => setCurrentScreen('focus')}
        />
        <NavButton
          icon={<Heart className="h-5 w-5" />}
          label="Mind"
          active={currentScreen === 'mindfulness'}
          onClick={() => setCurrentScreen('mindfulness')}
        />
      </div>
    </div>
  );
}

function HomeScreen({ userName, onNavigate }: { userName: string; onNavigate: (screen: Screen) => void }) {
  return (
    <div className="p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl">Hello, {userName}!</h2>
        <p className="text-muted-foreground">How can we help you today?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <QuickActionCard
          icon={<Pill className="h-6 w-6" />}
          title="Take Meds"
          description="Time for your medication"
          color="bg-blue-500"
          onClick={() => onNavigate('medication')}
        />
        <QuickActionCard
          icon={<Utensils className="h-6 w-6" />}
          title="Plan Meals"
          description="What's for dinner?"
          color="bg-green-500"
          onClick={() => onNavigate('meals')}
        />
        <QuickActionCard
          icon={<Brain className="h-6 w-6" />}
          title="Focus Time"
          description="Start studying"
          color="bg-purple-500"
          onClick={() => onNavigate('focus')}
        />
        <QuickActionCard
          icon={<Heart className="h-6 w-6" />}
          title="Mindfulness"
          description="Take a break"
          color="bg-orange-500"
          onClick={() => onNavigate('mindfulness')}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Pill className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Morning Medication</span>
            </div>
            <Badge variant="secondary">9:00 AM</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Utensils className="h-4 w-4 text-green-600" />
              <span className="text-sm">Meal Prep</span>
            </div>
            <Badge variant="secondary">12:00 PM</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Study Session</span>
            </div>
            <Badge variant="secondary">2:00 PM</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickActionCard({ 
  icon, 
  title, 
  description, 
  color, 
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  color: string; 
  onClick: () => void;
}) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4 text-center space-y-2">
        <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white mx-auto`}>
          {icon}
        </div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function NavButton({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-3 space-y-1 transition-colors ${
        active 
          ? 'text-primary bg-primary/10' 
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}