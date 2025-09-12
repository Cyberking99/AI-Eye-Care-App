import { apiClient } from './config';

export interface EyeTest {
  id: string;
  name: string;
  description: string;
  type: 'visual_acuity' | 'color_blindness' | 'contrast_sensitivity' | 'peripheral_vision';
  duration: number; // in minutes
  instructions: string[];
  imageUrl?: string;
}

export interface TestResult {
  id: string;
  name: string;
  testId: string;
  userId: string;
  score: number;
  maxScore: number;
  percentage: number;
  details: {
    correctAnswers: number;
    totalQuestions: number;
    timeTaken: number;
    [key: string]: any;
  };
  template: {
    name: string;
  };
  createdAt: string;
  completedAt?: string;
  recommendations?: string[];
}

export interface TestProgress {
  totalTests: number;
  averageScore: number;
  lastTestDate?: string;
  improvementTrend: 'improving' | 'stable' | 'declining';
}

export const testsService = {
  // Get all available tests
  async getTests(): Promise<EyeTest[]> {
    return await apiClient.get<EyeTest[]>('/tests');
  },

  // Get a specific test by ID
  async getTest(testId: string): Promise<EyeTest> {
    return await apiClient.get<EyeTest>(`/tests/${testId}`);
  },

  // Get tests by type
  async getTestsByType(type: EyeTest['type']): Promise<EyeTest[]> {
    return await apiClient.get<EyeTest[]>(`/tests/type/${type}`);
  },

  // Start a test (server expects id in path)
  async startTest(testId: string): Promise<{ sessionId: string }> {
    return await apiClient.post<{ sessionId: string }>(`/tests/start/${testId}`);
  },

  // Submit test answers (server expects session id in path)
  async submitTest(sessionId: string, answers: any[]): Promise<TestResult> {
    return await apiClient.post<TestResult>(`/tests/submit/${sessionId}`, { answers });
  },

  // Get user's test history
  async getTestHistory(): Promise<TestResult[]> {
    return await apiClient.get<TestResult[]>('/tests/history');
  },

  // Get user's test progress (summary)
  async getTestProgress(): Promise<TestProgress> {
    return await apiClient.get<TestProgress>('/tests/progress');
  },

  // Get a specific test result
  async getTestResult(resultId: string): Promise<TestResult> {
    return await apiClient.get<TestResult>(`/tests/result/${resultId}`);
  },
};
