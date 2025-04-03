export interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language?: string;
  simplified?: boolean;
}

export interface HealthProfile {
  id: string;
  age: number;
  gender: string;
  medicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  chronicConditions: string[];
  fitnessGoals: string[];
  dietaryRestrictions: string[];
  appointments: Appointment[];
  reminders: Reminder[];
  moodEntries: MoodEntry[];
}

export interface Appointment {
  id: string;
  title: string;
  date: Date;
  doctor: string;
  location: string;
  notes: string;
}

export interface Reminder {
  id: string;
  type: 'medication' | 'exercise' | 'appointment' | 'other';
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;
  days?: string[];
  completed: boolean;
}

export interface MoodEntry {
  id: string;
  date: Date;
  mood: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible';
  notes: string;
}

export interface PredictionResult {
  possibleConditions: Array<{
    condition: string;
    probability: number;
    description: string;
    recommendedAction: string;
    urgencyLevel: 'immediate' | 'urgent' | 'routine' | 'self-care';
    researchSummary?: string;
  }>;
  disclaimer: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  intensity: 'low' | 'moderate' | 'high';
  frequency: string;
  contraindications: string[];
}

export interface DietPlan {
  id: string;
  name: string;
  description: string;
  restrictions: string[];
  recommendations: string[];
  meals: Array<{
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    suggestions: string[];
  }>;
}