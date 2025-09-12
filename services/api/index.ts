// Export all API services
export { authService } from './auth';
export { chatService } from './chat';
export { API_BASE_URL, apiClient } from './config';
export { educationService } from './educations';
export { exercisesService } from './exercises';
export { scansService } from './scans';
export { testsService } from './tests';

// Export types
export type { AuthResponse, LoginRequest, RegisterRequest, User } from './auth';
export type { ChatConversation, ChatMessage, SendMessageRequest, SendMessageResponse } from './chat';
export type { EducationResource } from './educations';
export type { Exercise, ExerciseProgress, ExerciseSession } from './exercises';
export type { EyeScan } from './scans';
export type { EyeTest, TestProgress, TestResult } from './tests';

