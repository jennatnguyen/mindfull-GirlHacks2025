// API configuration and utilities  
import { Platform } from 'react-native';
import { EXPO_PUBLIC_API_BASE_URL } from '@env';

// Helper to normalize base => ensure it ends with '/api'
function normalizeBaseUrl(base: string): string {
  if (!base) return base;
  const noTrailing = base.replace(/\/$/, '');
  return noTrailing.endsWith('/api') ? noTrailing : `${noTrailing}/api`;
}

// Use EXPO_PUBLIC_API_BASE_URL with platform-specific fallbacks
export const API_BASE_URL = (() => {
  const envBase = normalizeBaseUrl(EXPO_PUBLIC_API_BASE_URL || '');
  
  if (__DEV__ && envBase) {
    console.log('[api] Using env API base:', envBase);
    return envBase;
  }
  
  if (__DEV__) {
    if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api';
    if (Platform.OS === 'web') return 'http://localhost:3000/api';
    return 'http://100.100.67.31:3000/api'; // iOS device - local network IP fallback
  }
  
  return 'https://your-production-api.com/api';
})();

// Legacy exports for backward compatibility
export const RECIPES_API_URL = `${API_BASE_URL.replace('/api', '')}/api/recipes`;
export const MEDICINE_API_URL = `${API_BASE_URL.replace('/api', '')}/api/medicine`;

// Generic API request function with error handling
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('API Request:', url);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, config);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// Medication API types
export interface Medication {
  id: string | number; // Database might return number
  user_id: string;
  name: string;
  dose: string | number; // Can be either string or number from backend
  description?: string;
  color?: string;
  shape?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MedicationLog {
  id: string;
  user_id: string;
  medication_id: string;
  scheduled_time: string;
  taken_time?: string;
  status: 'taken' | 'skipped' | 'missed';
  reason?: string;
  medications?: {
    name: string;
    dose: string;
  };
}

export interface MedicationSchedule {
  id: string;
  medication_id: string;
  user_id: string;
  scheduled_time: string;
}

export interface CreateMedicationData {
  user_id: string;
  name: string;
  dose: string;
  description?: string;
  color?: string;
  shape?: string;
}

export interface UpdateMedicationData {
  name?: string;
  dose?: string;
  description?: string;
  color?: string;
  shape?: string;
}

export interface CreateMedicationLogData {
  user_id: string;
  medication_id: string;
  scheduled_time: string;
  reason?: string;
}

export interface CreateScheduleData {
  medication_id: string;
  user_id: string;
  scheduled_time: string;
}

// Medication API functions
export const medicationAPI = {
  // Get all medications for a user
  getAll: async (userId: string): Promise<{ medications: Medication[] }> => {
    return apiRequest(`/medicine/${userId}`);
  },

  // Get medication schedules for a user
  getSchedules: async (userId: string): Promise<{ scheduled_times: MedicationSchedule[] }> => {
    return apiRequest(`/medicine/schedules/${userId}`);
  },

  // Get medication logs (adherence history)
  getLogs: async (userId: string): Promise<{ logs: MedicationLog[] }> => {
    return apiRequest(`/medicine/logs/${userId}`);
  },

  // Create a new medication
  create: async (medicationData: CreateMedicationData): Promise<{ message: string; medication: Medication }> => {
    return apiRequest('/medicine', {
      method: 'POST',
      body: JSON.stringify(medicationData),
    });
  },

  // Update a medication
  update: async (id: string, medicationData: UpdateMedicationData): Promise<{ message: string; medication: Medication }> => {
    return apiRequest(`/medicine/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medicationData),
    });
  },

  // Delete a medication
  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`/medicine/${id}`, {
      method: 'DELETE',
    });
  },

  // Log a skipped medication
  logSkip: async (logData: CreateMedicationLogData): Promise<{ message: string; log: MedicationLog }> => {
    return apiRequest('/medicine/logs', {
      method: 'POST',
      body: JSON.stringify(logData),
    });
  },

  // Create a medication schedule
  createSchedule: async (scheduleData: CreateScheduleData): Promise<{ message: string; schedule: MedicationSchedule }> => {
    return apiRequest('/medicine/schedule', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  },
};

// Recipe API types and functions
export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  prep_time?: number;
  cook_time?: number;
  servings?: number;
}

export const recipeAPI = {
  // Generate recipes from user request
  generate: async (userRequest: string): Promise<{ success: boolean; data: { userRequest: string; recipes: Recipe[]; generated_at: string } }> => {
    return apiRequest('/recipes/generate', {
      method: 'POST',
      body: JSON.stringify({ userRequest }),
    });
  },

  // Save a recipe to favorites
  save: async (userId: string, recipe: Recipe): Promise<{ success: boolean; message: string; data: any }> => {
    return apiRequest('/recipes/save', {
      method: 'POST',
      body: JSON.stringify({ userId, recipe }),
    });
  },

  // Get saved recipes
  getSaved: async (userId: string): Promise<{ success: boolean; data: any[] }> => {
    return apiRequest(`/recipes/saved/${userId}`);
  },

  // Remove saved recipe
  removeSaved: async (userId: string, recipeId: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/recipes/saved/${userId}/${recipeId}`, {
      method: 'DELETE',
    });
  },
};