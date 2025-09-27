import React, { useState } from 'react';
import { Plus, Pill, Camera, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';

interface Medication {
  id: string;
  name: string;
  dose: string;
  description: string;
  time: string;
  taken: boolean;
  pillsRemaining: number;
}

export function MindfullMedicationScreen() {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Adderall',
      dose: '20mg',
      description: 'Orange oval pill',
      time: '9:00 AM',
      taken: false,
      pillsRemaining: 15
    },
    {
      id: '2',
      name: 'Multivitamin',
      dose: '1 tablet',
      description: 'Large brown capsule',
      time: '9:00 AM',
      taken: true,
      pillsRemaining: 5
    }
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);

  const handleTakeMedication = (med: Medication) => {
    setSelectedMed(med);
    setShowVerificationDialog(true);
  };

  const handleMedVerified = () => {
    if (selectedMed) {
      setMedications(prev => 
        prev.map(med => 
          med.id === selectedMed.id 
            ? { ...med, taken: true, pillsRemaining: med.pillsRemaining - 1 }
            : med
        )
      );
    }
    setShowVerificationDialog(false);
    setSelectedMed(null);
  };

  const upcomingMeds = medications.filter(med => !med.taken);
  const lowStockMeds = medications.filter(med => med.pillsRemaining <= 5);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Medications</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Med
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
            </DialogHeader>
            <AddMedicationForm onClose={() => setShowAddDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alert */}
      {lowStockMeds.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {lowStockMeds.length} medication(s) running low. Time to refill!
          </AlertDescription>
        </Alert>
      )}

      {/* Upcoming Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Due Now
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingMeds.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              All medications taken for now! 🎉
            </p>
          ) : (
            upcomingMeds.map(med => (
              <MedicationCard 
                key={med.id} 
                medication={med} 
                onTake={() => handleTakeMedication(med)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* All Medications */}
      <Card>
        <CardHeader>
          <CardTitle>All Medications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {medications.map(med => (
            <div key={med.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  med.taken ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {med.taken ? <CheckCircle className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-medium">{med.name} - {med.dose}</p>
                  <p className="text-sm text-muted-foreground">{med.description}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={med.pillsRemaining <= 5 ? "destructive" : "secondary"}>
                  {med.pillsRemaining} left
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">{med.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Medication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Take a photo of your {selectedMed?.name} pill to confirm you're taking the right medication.
            </p>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Camera preview would appear here</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowVerificationDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleMedVerified}
              >
                Verify & Take
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MedicationCard({ 
  medication, 
  onTake 
}: { 
  medication: Medication; 
  onTake: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
          <Pill className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{medication.name}</p>
          <p className="text-sm text-muted-foreground">{medication.dose} • {medication.description}</p>
        </div>
      </div>
      <div className="text-right space-y-2">
        <Badge variant="secondary">{medication.time}</Badge>
        <br />
        <Button size="sm" onClick={onTake}>
          Take Now
        </Button>
      </div>
    </div>
  );
}

function AddMedicationForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Medication Name</Label>
        <Input id="name" placeholder="e.g., Adderall" />
      </div>
      <div>
        <Label htmlFor="dose">Dose</Label>
        <Input id="dose" placeholder="e.g., 20mg" />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="Color, shape, size..." />
      </div>
      <div>
        <Label htmlFor="time">Time</Label>
        <Input id="time" type="time" />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={onClose}>
          Add Medication
        </Button>
      </div>
    </div>
  );
}