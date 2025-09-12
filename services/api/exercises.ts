import { apiClient } from './config';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  type: 'focus' | 'tracking' | 'strength' | 'relaxation';
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  benefits: string[];
  imageUrl?: string;
}

export interface ExerciseSession {
  id: string;
  exerciseId: string;
  userId: string;
  exercise: {
    title: string;
  }
  completedAt: string;
  duration: number; // actual duration in minutes
  score?: number;
  notes?: string;
}

export interface ExerciseProgress {
  totalSessions: number;
  totalDuration: number;
  averageScore: number;
  lastCompleted?: string;
  streak: number;
}

export const exercisesService = {
  // Get all available exercises
  async getExercises(): Promise<Exercise[]> {
    return await apiClient.get<Exercise[]>('/exercises');
  },

  // Get a specific exercise by ID
  async getExercise(exerciseId: string): Promise<Exercise> {
    return await apiClient.get<Exercise>(`/exercises/${exerciseId}`);
  },

  // Get exercises by type
  async getExercisesByType(type: Exercise['type']): Promise<Exercise[]> {
    return await apiClient.get<Exercise[]>(`/exercises/type/${type}`);
  },

  // Start an exercise session (server expects id in path)
  async startExercise(exerciseId: string): Promise<ExerciseSession> {
    return await apiClient.post<ExerciseSession>(`/exercises/start/${exerciseId}`);
  },

  // Complete an exercise session (server expects session id in path)
  async completeExercise(sessionId: string, data: {
    durationSec: number;
    score?: number;
    notes?: string;
  }): Promise<ExerciseSession> {
    return await apiClient.post<ExerciseSession>(`/exercises/complete/${sessionId}`, data);
  },

  // Get user's exercise history
  async getExerciseHistory(): Promise<ExerciseSession[]> {
    return await apiClient.get<ExerciseSession[]>('/exercises/history');
  },

  // Get user's exercise progress
  async getExerciseProgress(): Promise<ExerciseProgress> {
    return await apiClient.get<ExerciseProgress>('/exercises/progress');
  },
};
