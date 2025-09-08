import { useEyeHealth } from "@/hooks/useEyeHealth";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { CheckCircle, Pause, Play, RotateCcw, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExerciseScreen() {
  const { exerciseType } = useLocalSearchParams<{ exerciseType: string }>();
  const { completeExercise } = useEyeHealth();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [animatedValue] = useState(new Animated.Value(1));

  const getExerciseConfig = () => {
    switch (exerciseType) {
      case "blinking":
        return {
          title: "Blinking Exercise",
          description: "Reduce eye strain and improve moisture",
          duration: 120, // 2 minutes
          steps: [
            "Close your eyes gently",
            "Hold for 2 seconds",
            "Open your eyes slowly",
            "Repeat the process",
          ],
          instruction: "Follow the blinking pattern to reduce eye strain",
        };
      case "focus-shift":
        return {
          title: "Focus Shifting",
          description: "Strengthen focusing muscles",
          duration: 180, // 3 minutes
          steps: [
            "Focus on a near object",
            "Hold focus for 3 seconds",
            "Shift to a distant object",
            "Hold focus for 3 seconds",
          ],
          instruction: "Alternate focus between near and far objects",
        };
      case "eye-rotation":
        return {
          title: "Eye Rotation",
          description: "Improve eye muscle flexibility",
          duration: 120, // 2 minutes
          steps: [
            "Look up slowly",
            "Look right slowly",
            "Look down slowly",
            "Look left slowly",
          ],
          instruction: "Rotate your eyes in a circular motion",
        };
      default:
        return {
          title: "Unknown Exercise",
          description: "",
          duration: 60,
          steps: [],
          instruction: "",
        };
    }
  };

  const config = getExerciseConfig();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isActive && timer < config.duration) {
      interval = setInterval(() => {
        setTimer(timer + 1);
        
        // Animate for blinking exercise
        if (exerciseType === "blinking") {
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start();
        }
        
        // Update step for multi-step exercises
        if (config.steps.length > 1) {
          setCurrentStep((timer + 1) % config.steps.length);
        }
      }, 1000);
    } else if (timer >= config.duration) {
      completeExerciseSession();
    }

    return () => clearInterval(interval);
  }, [isActive, timer, config.duration]);

  const completeExerciseSession = async () => {
    setIsActive(false);
    setIsComplete(true);
    // Legacy screen: pass minimal required args (id, duration). Use type as id placeholder.
    await completeExercise(String(exerciseType || "custom"), timer);
  };

  const toggleExercise = () => {
    setIsActive(!isActive);
  };

  const resetExercise = () => {
    setIsActive(false);
    setTimer(0);
    setCurrentStep(0);
    setIsComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderExerciseContent = () => {
    switch (exerciseType) {
      case "blinking":
        return (
          <Animated.View
            style={[
              styles.exerciseVisual,
              { opacity: animatedValue },
            ]}
          >
            <View style={styles.eyeContainer}>
              <View style={styles.eye} />
              <View style={styles.eye} />
            </View>
            <Text style={styles.exerciseInstruction}>
              {isActive ? "Blink slowly and gently" : "Tap play to start"}
            </Text>
          </Animated.View>
        );

      case "focus-shift":
        return (
          <View style={styles.exerciseVisual}>
            <View style={styles.focusTargets}>
              <View
                style={[
                  styles.focusTarget,
                  styles.nearTarget,
                  currentStep < 2 && styles.activeTarget,
                ]}
              >
                <Text style={styles.targetText}>NEAR</Text>
              </View>
              <View
                style={[
                  styles.focusTarget,
                  styles.farTarget,
                  currentStep >= 2 && styles.activeTarget,
                ]}
              >
                <Text style={styles.targetText}>FAR</Text>
              </View>
            </View>
            <Text style={styles.exerciseInstruction}>
              {config.steps[currentStep] || "Focus on the highlighted target"}
            </Text>
          </View>
        );

      case "eye-rotation":
        return (
          <View style={styles.exerciseVisual}>
            <View style={styles.rotationGuide}>
              <View
                style={[
                  styles.directionDot,
                  styles.topDot,
                  currentStep === 0 && styles.activeDot,
                ]}
              />
              <View
                style={[
                  styles.directionDot,
                  styles.rightDot,
                  currentStep === 1 && styles.activeDot,
                ]}
              />
              <View
                style={[
                  styles.directionDot,
                  styles.bottomDot,
                  currentStep === 2 && styles.activeDot,
                ]}
              />
              <View
                style={[
                  styles.directionDot,
                  styles.leftDot,
                  currentStep === 3 && styles.activeDot,
                ]}
              />
            </View>
            <Text style={styles.exerciseInstruction}>
              {config.steps[currentStep] || "Follow the highlighted direction"}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Exercise Complete", headerShown: true }} />
        <View style={styles.completionContainer}>
          <CheckCircle color="#4CAF50" size={64} />
          <Text style={styles.completionTitle}>Great Job!</Text>
          <Text style={styles.completionDescription}>
            You&apos;ve completed the {config.title.toLowerCase()}
          </Text>
          <Text style={styles.completionTime}>
            Duration: {formatTime(config.duration)}
          </Text>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.back()}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: config.title,
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X color="#1A1A1A" size={24} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.header}>
        <Text style={styles.description}>{config.description}</Text>
        <Text style={styles.instruction}>{config.instruction}</Text>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formatTime(timer)}</Text>
        <Text style={styles.totalTime}>/ {formatTime(config.duration)}</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(timer / config.duration) * 100}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.exerciseContainer}>
        {renderExerciseContent()}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={resetExercise}
        >
          <RotateCcw color="#666666" size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.playButton, isActive && styles.pauseButton]}
          onPress={toggleExercise}
        >
          {isActive ? (
            <Pause color="#FFFFFF" size={32} />
          ) : (
            <Play color="#FFFFFF" size={32} />
          )}
        </TouchableOpacity>
        
        <View style={styles.controlButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    padding: 24,
    alignItems: "center",
  },
  description: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 8,
  },
  instruction: {
    fontSize: 18,
    color: "#1A1A1A",
    textAlign: "center",
    fontWeight: "500",
  },
  timerContainer: {
    alignItems: "center",
    padding: 24,
  },
  timer: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2E86AB",
  },
  totalTime: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 16,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#E5E5EA",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2E86AB",
    borderRadius: 2,
  },
  exerciseContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  exerciseVisual: {
    alignItems: "center",
  },
  eyeContainer: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 32,
  },
  eye: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2E86AB",
  },
  focusTargets: {
    alignItems: "center",
    gap: 40,
    marginBottom: 32,
  },
  focusTarget: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 2,
    borderColor: "#E5E5EA",
  },
  nearTarget: {},
  farTarget: {},
  activeTarget: {
    backgroundColor: "#2E86AB",
    borderColor: "#2E86AB",
  },
  targetText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666666",
  },
  rotationGuide: {
    width: 120,
    height: 120,
    position: "relative",
    marginBottom: 32,
  },
  directionDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E5E5EA",
    position: "absolute",
  },
  topDot: {
    top: 0,
    left: "50%",
    marginLeft: -8,
  },
  rightDot: {
    right: 0,
    top: "50%",
    marginTop: -8,
  },
  bottomDot: {
    bottom: 0,
    left: "50%",
    marginLeft: -8,
  },
  leftDot: {
    left: 0,
    top: "50%",
    marginTop: -8,
  },
  activeDot: {
    backgroundColor: "#2E86AB",
  },
  exerciseInstruction: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2E86AB",
    justifyContent: "center",
    alignItems: "center",
  },
  pauseButton: {
    backgroundColor: "#FF5722",
  },
  completionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginTop: 24,
    marginBottom: 8,
  },
  completionDescription: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 8,
  },
  completionTime: {
    fontSize: 14,
    color: "#2E86AB",
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: "#2E86AB",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});