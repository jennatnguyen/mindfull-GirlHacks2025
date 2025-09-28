import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { medicationAPI, type Medication, type CreateMedicationData, type UpdateMedicationData, type MedicationLog } from '../../utils/api';

// Enhanced medication type that matches your current frontend interface
export interface MedicationWithUI {
  id: string; // Always string after transformation
  user_id: string;
  name: string;
  dose: string; // Always string after transformation
  description?: string;
  color?: string;
  shape?: string;
  created_at?: string;
  updated_at?: string;
  // UI-specific properties
  time: string; // Display time (e.g., "9:00 AM")
  taken: boolean; // Current day taken status
  pillsRemaining: number; // Stock tracking
}

export interface UseMedicationsOptions {
  userId: string;
}

export interface UseMedicationsReturn {
  medications: MedicationWithUI[];
  loading: boolean;
  error: string | null;
  upcomingMeds: MedicationWithUI[];
  lowStockMeds: MedicationWithUI[];
  
  // Actions
  addMedication: (medication: Omit<CreateMedicationData, 'user_id'>) => Promise<boolean>;
  updateMedication: (id: string, updates: UpdateMedicationData) => Promise<boolean>;
  deleteMedication: (id: string) => Promise<boolean>;
  markAsTaken: (medicationId: string) => Promise<boolean>;
  skipMedication: (medicationId: string, reason: string) => Promise<boolean>;
  refreshMedications: () => Promise<void>;
}

export function useMedications({ userId }: UseMedicationsOptions): UseMedicationsReturn {
  const [medications, setMedications] = useState<MedicationWithUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert backend medication to frontend format
  const transformMedication = useCallback((med: Medication): MedicationWithUI => {
  console.log('Transforming medication:', med);
    const transformed = {
      // Convert all fields to proper types
      id: String(med.id), // Ensure ID is string
      user_id: med.user_id,
      name: med.name,
      dose: String(med.dose), // Ensure dose is string
      description: med.description || '',
      color: med.color,
      shape: med.shape,
      created_at: med.created_at,
      updated_at: med.updated_at,
      // UI-specific fields
      time: '9:00 AM', // TODO: Get from schedules API or set default
      taken: false, // TODO: Check today's logs to determine if taken
      pillsRemaining: 30, // TODO: Calculate from logs or add to backend
    };
  console.log('Transformed to:', transformed);
    return transformed;
  }, []);

  // Load medications from API
  const loadMedications = useCallback(async () => {
    if (!userId) {
      console.log('No userId provided');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await medicationAPI.getAll(userId);
      console.log('Medications API response:', response);
      
      const transformedMeds = response.medications.map(transformMedication);
  console.log('Transformed medications:', transformedMeds);
      
      setMedications(transformedMeds);
  console.log('Medications loaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load medications';
      console.error('Error loading medications:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('Loading finished');
    }
  }, [userId, transformMedication]);

  // Load medications on mount and when userId changes
  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  // Add a new medication
  const addMedication = useCallback(async (medicationData: Omit<CreateMedicationData, 'user_id'>): Promise<boolean> => {
    try {
      const response = await medicationAPI.create({
        ...medicationData,
        user_id: userId,
      });

      const newMed = transformMedication(response.medication);
      setMedications(prev => [newMed, ...prev]);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add medication';
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, [userId, transformMedication]);

  // Update a medication
  const updateMedication = useCallback(async (id: string, updates: UpdateMedicationData): Promise<boolean> => {
    try {
      const response = await medicationAPI.update(id, updates);
      // Normalize to MedicationWithUI and preserve existing UI-only fields
      const normalized = transformMedication(response.medication);
      setMedications(prev => 
        prev.map(med => {
          if (med.id !== id) return med;
          return {
            ...med, // keep UI fields like time/taken/pillsRemaining
            ...normalized,
            time: med.time,
            taken: med.taken,
            pillsRemaining: med.pillsRemaining,
          } as MedicationWithUI;
        })
      );
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update medication';
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, [transformMedication]);

  // Delete a medication
  const deleteMedication = useCallback(async (id: string): Promise<boolean> => {
    try {
      await medicationAPI.delete(id);
      
      setMedications(prev => prev.filter(med => med.id !== id));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete medication';
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, []);

  // Mark medication as taken (update local state)
  const markAsTaken = useCallback(async (medicationId: string): Promise<boolean> => {
    try {
      // Update local state immediately for better UX
      setMedications(prev => 
        prev.map(med => 
          med.id === medicationId 
            ? { 
                ...med, 
                taken: true, 
                pillsRemaining: Math.max(0, med.pillsRemaining - 1) 
              } 
            : med
        )
      );

      // TODO: Log this as "taken" in the backend
      // await medicationAPI.logTaken(medicationId, userId);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as taken';
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, []);

  // Skip a medication with reason
  const skipMedication = useCallback(async (medicationId: string, reason: string): Promise<boolean> => {
    try {
      // Log skip in backend
      await medicationAPI.logSkip({
        user_id: userId,
        medication_id: medicationId,
        scheduled_time: new Date().toISOString(),
        reason,
      });

      // Update local state to mark as "taken" (skipped for today)
      setMedications(prev => 
        prev.map(med => 
          med.id === medicationId 
            ? { ...med, taken: true } 
            : med
        )
      );
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to log skip';
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, [userId]);

  // Refresh medications (useful for pull-to-refresh)
  const refreshMedications = useCallback(async () => {
    await loadMedications();
  }, [loadMedications]);

  // Computed values
  const upcomingMeds = medications.filter(med => !med.taken);
  const lowStockMeds = medications.filter(med => med.pillsRemaining <= 5);

  return {
    medications,
    loading,
    error,
    upcomingMeds,
    lowStockMeds,
    addMedication,
    updateMedication,
    deleteMedication,
    markAsTaken,
    skipMedication,
    refreshMedications,
  };
}