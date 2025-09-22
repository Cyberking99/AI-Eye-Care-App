import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  authService,
  chatService,
  educationService,
  exercisesService,
  scansService,
  SendMessageRequest,
  testsService
} from '../services/api';

// Query Keys
export const queryKeys = {
  profile: ['profile'] as const,
  exercises: ['exercises'] as const,
  exerciseHistory: ['exerciseHistory'] as const,
  exerciseProgress: ['exerciseProgress'] as const,
  tests: ['tests'] as const,
  testHistory: ['testHistory'] as const,
  testProgress: ['testProgress'] as const,
  scans: (userId: string) => ['scans', userId] as const,
  chatHistory: ['chatHistory'] as const,
  education: ['education'] as const,
};

// Auth Hooks
export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: authService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
};

// Exercise Hooks
export const useExercises = () => {
  return useQuery({
    queryKey: queryKeys.exercises,
    queryFn: exercisesService.getExercises,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useExerciseHistory = () => {
  return useQuery({
    queryKey: queryKeys.exerciseHistory,
    queryFn: exercisesService.getExerciseHistory,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useExerciseProgress = () => {
  return useQuery({
    queryKey: queryKeys.exerciseProgress,
    queryFn: exercisesService.getExerciseProgress,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useStartExercise = () => {
  return useMutation({
    mutationFn: (exerciseId: string) => exercisesService.startExercise(exerciseId),
  });
};

export const useCompleteExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionId, data }: {
      sessionId: string;
      data: {
        durationSec: number;
        score?: number;
        notes?: string;
      }
    }) => {
      return exercisesService.completeExercise(sessionId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exerciseHistory });
      queryClient.invalidateQueries({ queryKey: queryKeys.exerciseProgress });
    },
  });
};

// Test Hooks
export const useTests = () => {
  return useQuery({
    queryKey: queryKeys.tests,
    queryFn: testsService.getTests,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTestHistory = () => {
  return useQuery({
    queryKey: queryKeys.testHistory,
    queryFn: testsService.getTestHistory,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTestProgress = () => {
  return useQuery({
    queryKey: queryKeys.testProgress,
    queryFn: testsService.getTestProgress,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSubmitTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ testId, answers }: { testId: string; answers: any[] }) => {
      const session = await testsService.startTest(testId);
      return testsService.submitTest(session.sessionId, answers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testHistory });
      queryClient.invalidateQueries({ queryKey: queryKeys.testProgress });
    },
  });
};

// Education Hooks
export const useEducationResources = () => {
  return useQuery({
    queryKey: queryKeys.education,
    queryFn: educationService.getResources,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Scan Hooks
export const useScans = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.scans(userId),
    queryFn: () => scansService.getUserScans(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUploadScan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: scansService.uploadScan,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scans(userId) });
    },
  });
};

// Chat Hooks
export const useChatHistory = () => {
  return useQuery({
    queryKey: queryKeys.chatHistory,
    queryFn: chatService.getHistory,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SendMessageRequest) => chatService.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatHistory });
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: chatService.deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatHistory });
    },
  });
};
