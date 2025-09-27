import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Heart, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';

interface StimActivity {
  id: string;
  name: string;
  type: 'visual' | 'haptic' | 'audio';
  icon: React.ReactNode;
  color: string;
}

export function MindfullMindfulnessScreen() {
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  const [breathingDuration, setBreathingDuration] = useState(4);
  
  const [hapticIntensity, setHapticIntensity] = useState([50]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [activeStimTool, setActiveStimTool] = useState<string | null>(null);

  const stimActivities: StimActivity[] = [
    {
      id: 'breathing',
      name: 'Breathing Guide',
      type: 'visual',
      icon: <Heart className="h-6 w-6" />,
      color: 'bg-blue-500'
    },
    {
      id: 'haptic',
      name: 'Haptic Pulse',
      type: 'haptic',
      icon: <Zap className="h-6 w-6" />,
      color: 'bg-purple-500'
    },
    {
      id: 'whitenoise',
      name: 'White Noise',
      type: 'audio',
      icon: <Volume2 className="h-6 w-6" />,
      color: 'bg-green-500'
    },
    {
      id: 'fidget',
      name: 'Visual Fidget',
      type: 'visual',
      icon: <RotateCcw className="h-6 w-6" />,
      color: 'bg-orange-500'
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathingCount(prev => {
          const newCount = prev + 1;
          const cyclePosition = newCount % (breathingDuration * 3);
          
          if (cyclePosition < breathingDuration) {
            setBreathingPhase('inhale');
          } else if (cyclePosition < breathingDuration * 2) {
            setBreathingPhase('hold');
          } else {
            setBreathingPhase('exhale');
          }
          
          return newCount;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathingActive, breathingDuration]);

  // Simulate haptic feedback
  useEffect(() => {
    if (activeStimTool === 'haptic' && 'vibrate' in navigator) {
      const vibrationPattern = Math.floor(hapticIntensity[0] * 2); // Convert intensity to vibration duration
      const interval = setInterval(() => {
        navigator.vibrate(vibrationPattern);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeStimTool, hapticIntensity]);

  const toggleBreathing = () => {
    setBreathingActive(!breathingActive);
    if (!breathingActive) {
      setBreathingCount(0);
      setBreathingPhase('inhale');
    }
  };

  const toggleStimTool = (toolId: string) => {
    setActiveStimTool(activeStimTool === toolId ? null : toolId);
  };

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
    }
  };

  const getBreathingColor = () => {
    switch (breathingPhase) {
      case 'inhale': return 'bg-blue-500';
      case 'hold': return 'bg-yellow-500';
      case 'exhale': return 'bg-green-500';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl">Mindfulness & Stimming</h2>
        <p className="text-muted-foreground">Tools to help you focus and self-regulate</p>
      </div>

      {/* Breathing Exercise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Breathing Exercise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className={`w-32 h-32 rounded-full mx-auto mb-4 transition-all duration-1000 ${getBreathingColor()} ${
              breathingActive ? 'animate-pulse' : ''
            }`}></div>
            
            <h3 className="text-xl font-medium mb-2">
              {breathingActive ? getBreathingInstruction() : 'Ready to begin'}
            </h3>
            
            {breathingActive && (
              <Badge variant="secondary">
                Cycle {Math.floor(breathingCount / (breathingDuration * 3)) + 1}
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Breath Duration: {breathingDuration} seconds</label>
              <Slider
                value={[breathingDuration]}
                onValueChange={(value) => setBreathingDuration(value[0])}
                max={8}
                min={3}
                step={1}
                className="mt-2"
                disabled={breathingActive}
              />
            </div>

            <Button onClick={toggleBreathing} className="w-full">
              {breathingActive ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Breathing Exercise
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Breathing Exercise
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stimming Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Stimming Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {stimActivities.map(activity => (
              <Button
                key={activity.id}
                variant={activeStimTool === activity.id ? "default" : "outline"}
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => toggleStimTool(activity.id)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                  activeStimTool === activity.id ? 'bg-white/20' : activity.color
                }`}>
                  {activity.icon}
                </div>
                <span className="text-sm">{activity.name}</span>
              </Button>
            ))}
          </div>

          {/* Haptic Controls */}
          {activeStimTool === 'haptic' && (
            <div className="p-4 bg-purple-50 rounded-lg space-y-3">
              <h4 className="font-medium">Haptic Settings</h4>
              <div>
                <label className="text-sm">Intensity: {hapticIntensity[0]}%</label>
                <Slider
                  value={hapticIntensity}
                  onValueChange={setHapticIntensity}
                  max={100}
                  min={10}
                  step={10}
                  className="mt-2"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your device will vibrate gently to help with sensory regulation
              </p>
            </div>
          )}

          {/* Audio Controls */}
          {activeStimTool === 'whitenoise' && (
            <div className="p-4 bg-green-50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">White Noise</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                >
                  {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
              <div className="text-center py-4">
                <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  audioEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                }`}>
                  <Volume2 className="h-8 w-8 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {audioEnabled ? 'Playing calming white noise' : 'Audio paused'}
                </p>
              </div>
            </div>
          )}

          {/* Visual Fidget */}
          {activeStimTool === 'fidget' && (
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium mb-3">Visual Fidget</h4>
              <div className="flex justify-center">
                <div className="w-24 h-24 border-4 border-orange-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Focus on the spinning circle to help with concentration
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Mindfulness Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm text-blue-900">5-4-3-2-1 Grounding</h4>
              <p className="text-xs text-blue-700">
                Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-sm text-green-900">Progressive Muscle Relaxation</h4>
              <p className="text-xs text-green-700">
                Tense and release each muscle group from toes to head
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-sm text-purple-900">Body Scan</h4>
              <p className="text-xs text-purple-700">
                Notice sensations throughout your body without judgment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}