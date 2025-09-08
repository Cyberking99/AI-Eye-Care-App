// Export all API services
export { apiClient, API_BASE_URL } from './config';
export { authService } from './auth';
export { chatService } from './chat';
export { scansService } from './scans';
export { exercisesService } from './exercises';
export { testsService } from './tests';

// Export types
export type { User, AuthResponse, LoginRequest, RegisterRequest } from './auth';
export type { ChatMessage, ChatConversation, SendMessageRequest, SendMessageResponse } from './chat';
export type { EyeScan, UploadScanResponse } from './scans';
export type { Exercise, ExerciseSession, ExerciseProgress } from './exercises';
export type { EyeTest, TestResult, TestProgress } from './tests';
