import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Lock, Unlock, BookOpen, Clock, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface FocusSession {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  startTime: Date;
  completed: boolean;
}

interface LockedApp {
  id: string;
  name: string;
  icon: string;
  locked: boolean;
}

export function MindfullFocusScreen() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState<LockedApp | null>(null);

  const [lockedApps, setLockedApps] = useState<LockedApp[]>([
    { id: '1', name: 'Instagram', icon: '📷', locked: true },
    { id: '2', name: 'TikTok', icon: '🎵', locked: true },
    { id: '3', name: 'Twitter', icon: '🐦', locked: false },
    { id: '4', name: 'YouTube', icon: '📺', locked: true },
    { id: '5', name: 'Reddit', icon: '🤖', locked: false },
    { id: '6', name: 'Snapchat', icon: '👻', locked: true }
  ]);

  const [recentSessions] = useState<FocusSession[]>([
    {
      id: '1',
      subject: 'Mathematics',
      topic: 'Calculus derivatives',
      duration: 45,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completed: true
    },
    {
      id: '2',
      subject: 'Chemistry',
      topic: 'Organic compounds',
      duration: 30,
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      completed: false
    }
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsSessionActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, timeLeft]);

  const startFocusSession = (subject: string, topic: string, duration: number) => {
    const session: FocusSession = {
      id: Date.now().toString(),
      subject,
      topic,
      duration,
      startTime: new Date(),
      completed: false
    };
    
    setCurrentSession(session);
    setTimeLeft(duration * 60);
    setIsSessionActive(true);
    setShowStartDialog(false);
    
    // Lock apps when session starts
    setLockedApps(prev => prev.map(app => ({ ...app, locked: true })));
  };

  const pauseSession = () => {
    setIsSessionActive(false);
  };

  const resumeSession = () => {
    setIsSessionActive(true);
  };

  const endSession = () => {
    setIsSessionActive(false);
    setCurrentSession(null);
    setTimeLeft(0);
    // Unlock apps when session ends
    setLockedApps(prev => prev.map(app => ({ ...app, locked: false })));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAppUnlock = (app: LockedApp) => {
    setSelectedApp(app);
    setShowUnlockDialog(true);
  };

  const submitUnlockChallenge = (summary: string) => {
    // In a real app, this would validate the summary using AI
    if (summary.trim().length >= 50) {
      setLockedApps(prev => 
        prev.map(app => 
          app.id === selectedApp?.id ? { ...app, locked: false } : app
        )
      );
      setShowUnlockDialog(false);
      setSelectedApp(null);
    } else {
      alert('Please provide a more detailed summary of what you learned (at least 50 characters)');
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Focus Mode</h2>
        {!isSessionActive && (
          <Button onClick={() => setShowStartDialog(true)}>
            <Play className="h-4 w-4 mr-2" />
            Start Session
          </Button>
        )}
      </div>

      {/* Active Session */}
      {currentSession && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Active Study Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">{currentSession.subject}</p>
              <p className="text-sm text-muted-foreground">{currentSession.topic}</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-purple-600">
                {formatTime(timeLeft)}
              </div>
              <Progress 
                value={(1 - timeLeft / (currentSession.duration * 60)) * 100} 
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              {isSessionActive ? (
                <Button variant="outline" onClick={pauseSession} className="flex-1">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button onClick={resumeSession} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}
              <Button variant="destructive" onClick={endSession} className="flex-1">
                <Square className="h-4 w-4 mr-2" />
                End Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locked Apps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            App Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {lockedApps.map(app => (
              <div
                key={app.id}
                className={`p-4 rounded-lg border text-center cursor-pointer transition-colors ${
                  app.locked 
                    ? 'bg-red-50 border-red-200 text-red-700' 
                    : 'bg-green-50 border-green-200 text-green-700'
                }`}
                onClick={() => app.locked && handleAppUnlock(app)}
              >
                <div className="text-2xl mb-2">{app.icon}</div>
                <p className="text-sm font-medium">{app.name}</p>
                <div className="mt-2">
                  {app.locked ? (
                    <Lock className="h-4 w-4 mx-auto" />
                  ) : (
                    <Unlock className="h-4 w-4 mx-auto" />
                  )}
                </div>
              </div>
            ))}
          </div>
          {isSessionActive && (
            <p className="text-sm text-muted-foreground mt-3 text-center">
              Apps are locked during focus sessions. Complete study tasks to unlock.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentSessions.map(session => (
            <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  session.completed ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{session.subject}</p>
                  <p className="text-sm text-muted-foreground">{session.topic}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={session.completed ? "default" : "secondary"}>
                  {session.duration} min
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {session.startTime.toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Start Session Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Focus Session</DialogTitle>
          </DialogHeader>
          <StartSessionForm onStart={startFocusSession} />
        </DialogContent>
      </Dialog>

      {/* Unlock App Dialog */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock {selectedApp?.name}</DialogTitle>
          </DialogHeader>
          <UnlockAppForm 
            app={selectedApp} 
            currentSession={currentSession}
            onSubmit={submitUnlockChallenge}
            onCancel={() => setShowUnlockDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StartSessionForm({ onStart }: { onStart: (subject: string, topic: string, duration: number) => void }) {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(25);

  const handleSubmit = () => {
    if (subject.trim() && topic.trim()) {
      onStart(subject, topic, duration);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="subject">Subject/Class</Label>
        <Input 
          id="subject" 
          value={subject} 
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Mathematics, Chemistry" 
        />
      </div>
      <div>
        <Label htmlFor="topic">What will you study?</Label>
        <Textarea 
          id="topic" 
          value={topic} 
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Calculus derivatives, Organic chemistry reactions" 
        />
      </div>
      <div>
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input 
          id="duration" 
          type="number" 
          value={duration} 
          onChange={(e) => setDuration(Number(e.target.value))}
          min="5" 
          max="120" 
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button className="flex-1" onClick={handleSubmit}>
          Start Session
        </Button>
      </div>
    </div>
  );
}

function UnlockAppForm({ 
  app, 
  currentSession, 
  onSubmit, 
  onCancel 
}: { 
  app: LockedApp | null; 
  currentSession: FocusSession | null;
  onSubmit: (summary: string) => void;
  onCancel: () => void;
}) {
  const [summary, setSummary] = useState('');

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        To unlock {app?.name}, please summarize what you've learned about{' '}
        <span className="font-medium">{currentSession?.topic}</span> during this study session.
      </p>
      
      <div>
        <Label htmlFor="summary">Study Summary</Label>
        <Textarea 
          id="summary" 
          value={summary} 
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Describe what you learned, key concepts covered, problems solved, etc."
          rows={4}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Minimum 50 characters ({summary.length}/50)
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          className="flex-1" 
          onClick={() => onSubmit(summary)}
          disabled={summary.trim().length < 50}
        >
          Unlock App
        </Button>
      </div>
    </div>
  );
}