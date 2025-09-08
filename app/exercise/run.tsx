import { useCompleteExercise, useStartExercise } from "@/hooks/useApi";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { CheckCircle, Pause, Play, RotateCcw, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExerciseRunScreen() {
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    description?: string;
    type?: string;
    difficulty?: string;
    durationSec?: string;
    instructions?: string;
  }>();

  const duration = Math.max(1, Number(params.durationSec || 60));
  const instructions = useMemo<string[]>(() => {
    try {
      return params.instructions ? JSON.parse(params.instructions) : [];
    } catch {
      return [];
    }
  }, [params.instructions]);

  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [animatedValue] = useState(new Animated.Value(1));

  const startExerciseMutation = useStartExercise();
  const completeExerciseMutation = useCompleteExercise();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timer < duration) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
        if (params.type === "relaxation") {
          Animated.sequence([ Animated.timing(animatedValue, { toValue: 0, duration: 400, useNativeDriver: true }), Animated.timing(animatedValue, { toValue: 1, duration: 400, useNativeDriver: true }), ]).start();
        }
        if (instructions.length > 1) {
          setCurrentStep((s) => (s + 1) % instructions.length);
        }
      }, 1000);
    } else if (isActive && timer >= duration) {
      setIsActive(false);
      setIsComplete(true);
      const completeSession = async () => {
        setIsSaving(true);
        try {
          const session = await startExerciseMutation.mutateAsync(params.id);
          await completeExerciseMutation.mutateAsync({ sessionId: session.id, data: { durationSec: duration, score: 100 } });
        } catch (error) {
          console.error("Failed to save exercise session:", error);
          Alert.alert("Error", "Could not save your exercise session. Please try again later.");
        } finally {
          setIsSaving(false);
        }
      };
      completeSession();
    }
    return () => clearInterval(interval);
  }, [isActive, timer, duration, instructions.length, params.type, params.id, startExerciseMutation, completeExerciseMutation]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Exercise Complete", headerShown: true }} />
        <View style={styles.center}>
          <CheckCircle color="#4CAF50" size={64} />
          <Text style={styles.doneTitle}>Great Job!</Text>
          <Text style={styles.doneText}>You&apos;ve completed the {String(params.title || '').toLowerCase()}</Text>
          <Text style={styles.doneMeta}>Duration: {formatTime(duration)}</Text>
          <TouchableOpacity
            style={[styles.doneButton, isSaving && styles.doneButtonDisabled]}
            onPress={() => router.back()}
            disabled={isSaving}
          >
            <Text style={styles.doneButtonText}>{isSaving ? "Saving..." : "Done"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: params.title || 'Exercise',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X color="#1A1A1A" size={24} />
            </TouchableOpacity>
          ),
        }} 
      />

      <View style={styles.header}>
        {!!params.description && <Text style={styles.description}>{params.description}</Text>}
        {instructions.length > 0 && (
          <Text style={styles.instruction}>{instructions[currentStep] || instructions[0]}</Text>
        )}
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formatTime(timer)}</Text>
        <Text style={styles.totalTime}>/ {formatTime(duration)}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(timer / duration) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.exerciseContainer}>
        {params.type === 'relaxation' && (
          <Animated.View style={[styles.exerciseVisual, { opacity: animatedValue }]}>
            <View style={styles.eyeRow}>
              <View style={styles.eye} />
              <View style={styles.eye} />
            </View>
            <Text style={styles.exerciseHint}>{isActive ? 'Blink slowly and gently' : 'Tap play to start'}</Text>
          </Animated.View>
        )}
        {params.type === 'focus' && (
          <View style={styles.exerciseVisual}>
            <View style={styles.focusTargets}>
              <View style={[styles.focusTarget, styles.nearTarget, currentStep < 2 && styles.activeTarget]}>
                <Text style={styles.targetText}>NEAR</Text>
              </View>
              <View style={[styles.focusTarget, styles.farTarget, currentStep >= 2 && styles.activeTarget]}>
                <Text style={styles.targetText}>FAR</Text>
              </View>
            </View>
            <Text style={styles.exerciseHint}>{instructions[currentStep] || 'Focus on the highlighted target'}</Text>
          </View>
        )}
        {params.type === 'tracking' && (
          <View style={styles.exerciseVisual}>
            <View style={styles.rotationGuide}>
              <View style={[styles.directionDot, styles.topDot, currentStep === 0 && styles.activeDot]} />
              <View style={[styles.directionDot, styles.rightDot, currentStep === 1 && styles.activeDot]} />
              <View style={[styles.directionDot, styles.bottomDot, currentStep === 2 && styles.activeDot]} />
              <View style={[styles.directionDot, styles.leftDot, currentStep === 3 && styles.activeDot]} />
            </View>
            <Text style={styles.exerciseHint}>{instructions[currentStep] || 'Follow the highlighted direction'}</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={() => { setIsActive(false); setTimer(0); setCurrentStep(0); setIsComplete(false); }}>
          <RotateCcw color="#666666" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.playButton, isActive && styles.pauseButton]} onPress={() => setIsActive((v) => !v)}>
          {isActive ? <Pause color="#FFFFFF" size={32} /> : <Play color="#FFFFFF" size={32} />}
        </TouchableOpacity>
        <View style={styles.controlButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { padding: 24, alignItems: "center" },
  description: { fontSize: 16, color: "#666666", marginBottom: 8 },
  instruction: { fontSize: 18, color: "#1A1A1A", textAlign: "center", fontWeight: "500" },
  timerContainer: { alignItems: "center", padding: 24 },
  timer: { fontSize: 48, fontWeight: "bold", color: "#2E86AB" },
  totalTime: { fontSize: 16, color: "#666666", marginBottom: 16 },
  progressBar: { width: "100%", height: 4, backgroundColor: "#E5E5EA", borderRadius: 2 },
  progressFill: { height: "100%", backgroundColor: "#2E86AB", borderRadius: 2 },
  exerciseContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  exerciseVisual: { alignItems: "center" },
  eyeRow: { flexDirection: "row", gap: 20, marginBottom: 32 },
  eye: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#2E86AB" },
  focusTargets: { alignItems: "center", gap: 40, marginBottom: 32 },
  focusTarget: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", backgroundColor: "#F8F9FA", borderWidth: 2, borderColor: "#E5E5EA" },
  nearTarget: {},
  farTarget: {},
  activeTarget: { backgroundColor: "#2E86AB", borderColor: "#2E86AB" },
  targetText: { fontSize: 12, fontWeight: "600", color: "#666666" },
  rotationGuide: { width: 120, height: 120, position: "relative", marginBottom: 32 },
  directionDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: "#E5E5EA", position: "absolute" },
  topDot: { top: 0, left: "50%", marginLeft: -8 },
  rightDot: { right: 0, top: "50%", marginTop: -8 },
  bottomDot: { bottom: 0, left: "50%", marginLeft: -8 },
  leftDot: { left: 0, top: "50%", marginTop: -8 },
  activeDot: { backgroundColor: "#2E86AB" },
  exerciseHint: { fontSize: 16, color: "#666666", textAlign: "center" },
  controls: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 24 },
  controlButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#F8F9FA", justifyContent: "center", alignItems: "center" },
  playButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#2E86AB", justifyContent: "center", alignItems: "center" },
  pauseButton: { backgroundColor: "#FF5722" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  doneTitle: { fontSize: 28, fontWeight: "bold", color: "#1A1A1A", marginTop: 24, marginBottom: 8 },
  doneText: { fontSize: 16, color: "#666666", textAlign: "center", marginBottom: 8 },
  doneMeta: { fontSize: 14, color: "#2E86AB", marginBottom: 32 },
  doneButton: { backgroundColor: "#2E86AB", paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  doneButtonDisabled: { backgroundColor: "#A5C8D7" },
  doneButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
