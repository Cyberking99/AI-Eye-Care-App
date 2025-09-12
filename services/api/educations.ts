import { apiClient } from './config';

export interface EducationResource {
  id: string;
  type: "book" | "journal" | "article";
  title: string;
  author: string;
  summary: string;
  coverImageUrl?: string;
  url: string;
  content?: string;
  publishedAt: string;
};

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

export const educationService = {
  // Get all available exercises
  async getResources(): Promise<EducationResource[]> {
    return await apiClient.get<EducationResource[]>('/educations');
  },
};
