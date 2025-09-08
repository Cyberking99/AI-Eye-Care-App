import { useExerciseHistory, useExerciseProgress, useExercises } from "@/hooks/useApi";
import { router } from "expo-router";
import { Activity, Eye, Focus, RotateCcw, Timer } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const { data: exercises, isLoading: isLoadingExercises, refetch: refetchExercises, isRefetching: isRefetchingExercises } = useExercises();
  const { data: exerciseHistory, isLoading: isLoadingHistory, refetch: refetchHistory, isRefetching: isRefetchingHistory } = useExerciseHistory();
  const { data: exerciseProgress, isLoading: isLoadingProgress, refetch: refetchProgress, isRefetching: isRefetchingProgress } = useExerciseProgress();

  const isLoading = isLoadingExercises || isLoadingHistory || isLoadingProgress;
  const refreshing = isRefetchingExercises || isRefetchingHistory || isRefetchingProgress;

  const onRefresh = async () => {
    await Promise.all([
      refetchExercises(),
      refetchHistory(),
      refetchProgress(),
    ]);
  };

  // Get today's completed exercises
  const today = new Date().toDateString();
  const todayExercises = exerciseHistory?.filter(session => 
    new Date(session.completedAt).toDateString() === today
  ).length || 0;

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'focus':
        return Focus;
      case 'tracking':
        return RotateCcw;
      case 'strength':
        return Activity;
      case 'relaxation':
        return Eye;
      default:
        return Eye;
    }
  };

  const getExerciseColor = (type: string) => {
    switch (type) {
      case 'focus':
        return "#2E86AB";
      case 'tracking':
        return "#A8DADC";
      case 'strength':
        return "#457B9D";
      case 'relaxation':
        return "#F4A261";
      default:
        return "#2E86AB";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return "#4CAF50";
      case 'intermediate':
        return "#FF9800";
      case 'advanced':
        return "#F44336";
      default:
        return "#2E86AB";
    }
  };

  const handleExercisePress = (ex: any) => {
    const type = ex?.config?.type || "";
    const durationMin = ex?.config?.durationMin ?? 1;
    const difficulty = ex?.config?.difficulty || "";
    const instructions: string[] = ex?.config?.instructions || [];

    router.push({
      pathname: "/exercise/run",
      params: {
        id: ex.id,
        title: ex.title,
        description: ex.description || "",
        type,
        difficulty,
        durationSec: String(Math.max(1, Math.floor(Number(durationMin) * 60))),
        instructions: JSON.stringify(instructions),
      },
    } as any);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Eye Exercises</Text>
        <Text style={styles.subtitle}>
          Daily exercises to keep your eyes healthy
        </Text>
        
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Today&apos;s Progress</Text>
          <Text style={styles.progressValue}>{todayExercises}/{exercises?.length || 0}</Text>
          <Text style={styles.progressLabel}>exercises completed</Text>
          
          {exerciseProgress && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{exerciseProgress.totalSessions}</Text>
                <Text style={styles.statLabel}>Total Sessions</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{exerciseProgress.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(exerciseProgress.averageScore)}</Text>
                <Text style={styles.statLabel}>Avg Score</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E86AB" colors={["#2E86AB"]} />}>
        {exercises?.map((exercise) => {
          const type = (exercise as any)?.config?.type || "";
          const durationMin = (exercise as any)?.config?.durationMin ?? 0;
          const difficulty = (exercise as any)?.config?.difficulty || "";

          const IconComponent = getExerciseIcon(type);
          const color = getExerciseColor(type);
          const difficultyColor = getDifficultyColor(difficulty);
          
          return (
            <TouchableOpacity
              key={exercise.id}
              style={styles.exerciseCard}
              onPress={() => handleExercisePress(exercise)}
              activeOpacity={0.8}
            >
              <View style={[styles.exerciseIcon, { backgroundColor: color }]}>
                <IconComponent color="#FFFFFF" size={24} />
              </View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseTitle}>{(exercise as any).title}</Text>
                <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                <View style={styles.exerciseMeta}>
                  <View style={styles.metaItem}>
                    <Timer color="#666666" size={14} />
                    <Text style={styles.metaText}>{durationMin} min</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '20', color: difficultyColor }]}>
                      {difficulty}
                    </Text>
                  </View>
                </View>
                <Text style={styles.exerciseType}>{String(type).replace(/_/g, ' ').toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Exercise Tips</Text>
          <Text style={styles.tipText}>
            • Do exercises in a well-lit room{"\n"}
            • Sit comfortably with good posture{"\n"}
            • Follow the guided instructions{"\n"}
            • Stop if you feel any discomfort{"\n"}
            • Complete exercises daily for best results
          </Text>
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 20,
  },
  progressCard: {
    backgroundColor: "#E8F5E8",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  progressTitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  progressLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 10,
    color: '#666666',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F8F9FA",
  },
  exerciseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  exerciseMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 4,
  },
  difficultyBadge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: '600',
  },
  exerciseType: {
    fontSize: 10,
    color: "#999999",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipCard: {
    backgroundColor: "#FFF3E0",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
});
