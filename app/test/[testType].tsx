import { useEyeHealth } from "@/hooks/useEyeHealth";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { CheckCircle, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function TestScreen() {
  const { testType } = useLocalSearchParams<{ testType: string }>();
  const { saveTestResult } = useEyeHealth();
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const getTestConfig = () => {
    switch (testType) {
      case "visual-acuity":
        return {
          title: "Visual Acuity Test",
          steps: [
            { letter: "E", size: 80, answer: "E" },
            { letter: "F", size: 60, answer: "F" },
            { letter: "P", size: 40, answer: "P" },
            { letter: "T", size: 30, answer: "T" },
            { letter: "O", size: 20, answer: "O" },
          ],
          instruction: "Read the letter shown on screen",
        };
      case "color-vision":
        return {
          title: "Color Vision Test",
          steps: [
            { number: "8", color: "#FF0000", background: "#00FF00" },
            { number: "3", color: "#0000FF", background: "#FFFF00" },
            { number: "6", color: "#FF00FF", background: "#00FFFF" },
            { number: "2", color: "#FFA500", background: "#800080" },
            { number: "9", color: "#008000", background: "#FF69B4" },
          ],
          instruction: "What number do you see?",
        };
      case "contrast":
        return {
          title: "Contrast Sensitivity Test",
          steps: [
            { pattern: "|||", contrast: 100 },
            { pattern: "|||", contrast: 75 },
            { pattern: "|||", contrast: 50 },
            { pattern: "|||", contrast: 25 },
            { pattern: "|||", contrast: 10 },
          ],
          instruction: "Can you see the vertical lines?",
        };
      default:
        return {
          title: "Unknown Test",
          steps: [],
          instruction: "",
        };
    }
  };

  const config = getTestConfig();
  const currentTest = config.steps[currentStep];

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentStep < config.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTest();
    }
  };

  const completeTest = async () => {
    const finalScore = Math.round((score / config.steps.length) * 100);
    
    await saveTestResult({
      id: Date.now().toString(),
      type: testType || "unknown",
      score: finalScore,
      date: new Date().toISOString(),
      details: { totalQuestions: config.steps.length, correctAnswers: score },
    });

    setIsComplete(true);
  };

  const renderTestContent = () => {
    if (!currentTest) return null;

    switch (testType) {
      case "visual-acuity":
        return (
          <View style={styles.testContent}>
            <Text style={[styles.testLetter, { fontSize: currentTest.size }]}>
              {currentTest.letter}
            </Text>
            <View style={styles.answerOptions}>
              {["E", "F", "P", "T", "O"].map((letter) => (
                <TouchableOpacity
                  key={letter}
                  style={styles.answerButton}
                  onPress={() => handleAnswer(letter === currentTest.answer)}
                >
                  <Text style={styles.answerText}>{letter}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case "color-vision":
        return (
          <View style={styles.testContent}>
            <View
              style={[
                styles.colorCircle,
                {
                  backgroundColor: currentTest.background,
                },
              ]}
            >
              <Text
                style={[
                  styles.colorNumber,
                  { color: currentTest.color },
                ]}
              >
                {currentTest.number}
              </Text>
            </View>
            <View style={styles.answerOptions}>
              {["1", "2", "3", "6", "8", "9"].map((number) => (
                <TouchableOpacity
                  key={number}
                  style={styles.answerButton}
                  onPress={() => handleAnswer(number === currentTest.number)}
                >
                  <Text style={styles.answerText}>{number}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case "contrast":
        return (
          <View style={styles.testContent}>
            <View style={styles.contrastBox}>
              <Text
                style={[
                  styles.contrastPattern,
                  { opacity: currentTest.contrast / 100 },
                ]}
              >
                {currentTest.pattern}
              </Text>
            </View>
            <View style={styles.answerOptions}>
              <TouchableOpacity
                style={styles.answerButton}
                onPress={() => handleAnswer(true)}
              >
                <Text style={styles.answerText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.answerButton}
                onPress={() => handleAnswer(false)}
              >
                <Text style={styles.answerText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (isComplete) {
    const finalScore = Math.round((score / config.steps.length) * 100);
    
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Test Complete", headerShown: true }} />
        <View style={styles.completionContainer}>
          <CheckCircle color="#4CAF50" size={64} />
          <Text style={styles.completionTitle}>Test Complete!</Text>
          <Text style={styles.scoreText}>Your Score: {finalScore}%</Text>
          <Text style={styles.scoreDescription}>
            {finalScore >= 80
              ? "Excellent! Your vision appears to be in good condition."
              : finalScore >= 60
              ? "Good results. Consider regular check-ups."
              : "Consider consulting with an eye care professional."}
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
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / config.steps.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {config.steps.length}
        </Text>
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instruction}>{config.instruction}</Text>
      </View>

      {renderTestContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  progressContainer: {
    padding: 24,
    paddingBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E5EA",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2E86AB",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  instructionContainer: {
    padding: 24,
    paddingTop: 0,
  },
  instruction: {
    fontSize: 18,
    color: "#1A1A1A",
    textAlign: "center",
    fontWeight: "500",
  },
  testContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  testLetter: {
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 40,
  },
  colorCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  colorNumber: {
    fontSize: 48,
    fontWeight: "bold",
  },
  contrastBox: {
    width: 200,
    height: 200,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 40,
  },
  contrastPattern: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#000000",
  },
  answerOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  answerButton: {
    backgroundColor: "#F8F9FA",
    borderWidth: 2,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    minWidth: 60,
  },
  answerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
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
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2E86AB",
    marginBottom: 12,
  },
  scoreDescription: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
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