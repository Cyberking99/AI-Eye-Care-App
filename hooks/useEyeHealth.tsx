import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import {
  ChatConversation,
  chatService,
  Exercise,
  ExerciseProgress,
  ExerciseSession,
  exercisesService,
  EyeScan,
  EyeTest,
  scansService,
  TestProgress,
  TestResult,
  testsService
} from "../services/api";
import { useAuth } from "./useAuth";

interface EyeHealthStats {
  totalTests: number;
  exercisesCompleted: number;
  daysActive: number;
  averageTestScore: number;
  currentStreak: number;
}

export const [EyeHealthProvider, useEyeHealth] = createContextHook(() => {
  const { user } = useAuth();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseSession[]>([]);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress | null>(null);
  
  const [tests, setTests] = useState<EyeTest[]>([]);
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [testProgress, setTestProgress] = useState<TestProgress | null>(null);
  
  const [scans, setScans] = useState<EyeScan[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatConversation[]>([]);
  
  const [stats, setStats] = useState<EyeHealthStats>({
    totalTests: 0,
    exercisesCompleted: 0,
    daysActive: 0,
    averageTestScore: 0,
    currentStreak: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadExercises(),
        loadExerciseHistory(),
        loadExerciseProgress(),
        loadTests(),
        loadTestHistory(),
        loadTestProgress(),
        loadScans(),
        loadChatHistory(),
      ]);
      updateStats();
    } catch (error) {
      console.error("Error loading eye health data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExercises = async () => {
    try {
      const data = await exercisesService.getExercises();
      setExercises(data);
    } catch (error) {
      console.error("Error loading exercises:", error);
    }
  };

  const loadExerciseHistory = async () => {
    try {
      const data = await exercisesService.getExerciseHistory();
      setExerciseHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading exercise history:", error);
      setExerciseHistory([]);
    }
  };

  const loadExerciseProgress = async () => {
    try {
      const data = await exercisesService.getExerciseProgress();
      setExerciseProgress(data);
    } catch (error) {
      console.error("Error loading exercise progress:", error);
    }
  };

  const loadTests = async () => {
    try {
      const data = await testsService.getTests();
      setTests(data);
    } catch (error) {
      console.error("Error loading tests:", error);
    }
  };

  const loadTestHistory = async () => {
    try {
      const data = await testsService.getTestHistory();
      setTestHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading test history:", error);
      setTestHistory([]);
    }
  };

  const loadTestProgress = async () => {
    try {
      const data = await testsService.getTestProgress();
      setTestProgress(data);
    } catch (error) {
      console.error("Error loading test progress:", error);
    }
  };

  const loadScans = async () => {
    try {
      // Note: This would need the current user ID
      // For now, we'll handle this in the component that uses this hook
    } catch (error) {
      console.error("Error loading scans:", error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const data = await chatService.getHistory();
      setChatHistory(data);
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const updateStats = () => {
    const totalTests = testHistory.length;
    const exercisesCompleted = exerciseHistory.length;
    const averageTestScore = testHistory.length > 0 
      ? testHistory.reduce((sum, test) => sum + test.percentage, 0) / testHistory.length 
      : 0;
    
    // Calculate days active (simplified)
    const uniqueDays = new Set(
      [...testHistory, ...exerciseHistory].map(item => 
        new Date(item.completedAt).toDateString()
      )
    ).size;

    setStats({
      totalTests,
      exercisesCompleted,
      daysActive: uniqueDays,
      averageTestScore,
      currentStreak: exerciseProgress?.streak || 0,
    });
  };

  const completeExercise = async (exerciseId: string, duration: number, score?: number, notes?: string) => {
    try {
      const session = await exercisesService.startExercise(exerciseId);
      const completedSession = await exercisesService.completeExercise(session.id, {
        durationSec: duration,
        score,
        notes,
      });
      
      setExerciseHistory(prev => [completedSession, ...prev]);
      await loadExerciseProgress();
      updateStats();
      
      return completedSession;
    } catch (error) {
      console.error("Error completing exercise:", error);
      throw error;
    }
  };

  const saveTestResult = async (testId: string, answers: any[]) => {
    try {
      const session = await testsService.startTest(testId);
      const result = await testsService.submitTest(session.sessionId, answers);
      
      setTestHistory(prev => [result, ...prev]);
      await loadTestProgress();
      updateStats();
      
      return result;
    } catch (error) {
      console.error("Error saving test result:", error);
      throw error;
    }
  };

  const uploadScan = async (imageUri: string) => {
    try {
      const scan = await scansService.uploadScan(imageUri);
      setScans(prev => [scan, ...prev]);
      return scan;
    } catch (error) {
      console.error("Error uploading scan:", error);
      throw error;
    }
  };

  const sendChatMessage = async (message: string, conversationId?: string) => {
    try {
      const response = await chatService.sendMessage({ message, conversationId });
      
      // Update chat history
      if (conversationId) {
        setChatHistory(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, messages: [...conv.messages, response.message] }
              : conv
          )
        );
      } else {
        // New conversation
        const newConversation: ChatConversation = {
          id: response.conversationId,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          messages: [response.message],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setChatHistory(prev => [newConversation, ...prev]);
      }
      
      return response;
    } catch (error) {
      console.error("Error sending chat message:", error);
      throw error;
    }
  };

  const refreshData = async () => {
    await loadAllData();
  };

  // Get today's completed exercises
  const today = new Date().toDateString();
  const todayExercises = (exerciseHistory ?? []).filter(session => 
    new Date(session.completedAt).toDateString() === today
  ).length;

  // Get recent tests (last 5)
  const recentTests = (testHistory ?? []).slice(0, 5);

  return {
    // User data
    user,
    
    // Data
    exercises,
    exerciseHistory,
    exerciseProgress,
    tests,
    testHistory,
    testProgress,
    scans,
    chatHistory,
    stats,
    isLoading,
    
    // Computed values
    recentTests,
    todayExercises,
    
    // Actions
    completeExercise,
    saveTestResult,
    uploadScan,
    sendChatMessage,
    refreshData,
    
    // Getters
    getExercisesByType: (type: Exercise['type']) => exercises.filter(ex => ex.type === type),
    getTestsByType: (type: EyeTest['type']) => tests.filter(test => test.type === type),
    getRecentTests: () => testHistory.slice(0, 5),
    getRecentExercises: () => exerciseHistory.slice(0, 5),
  };
});
