import { useExerciseHistory, useExerciseProgress, useTestHistory, useTestProgress } from "@/hooks/useApi";
import React from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { data: exerciseProgress, isLoading: loadingExerciseProgress, refetch: refetchExerciseProgress, isRefetching: refetchingExerciseProgress } = useExerciseProgress();
  const { data: testProgress, isLoading: loadingTestProgress, refetch: refetchTestProgress, isRefetching: refetchingTestProgress } = useTestProgress();
  const { data: exerciseHistory, isLoading: loadingExerciseHistory, refetch: refetchExerciseHistory, isRefetching: refetchingExerciseHistory } = useExerciseHistory();
  const { data: testHistory, isLoading: loadingTestHistory, refetch: refetchTestHistory, isRefetching: refetchingTestHistory } = useTestHistory();

  const isLoading = loadingExerciseProgress || loadingTestProgress || loadingExerciseHistory || loadingTestHistory;
  const refreshing = refetchingExerciseProgress || refetchingTestProgress || refetchingExerciseHistory || refetchingTestHistory;

  const onRefresh = async () => {
    await Promise.all([
      refetchExerciseProgress(),
      refetchTestProgress(),
      refetchExerciseHistory(),
      refetchTestHistory(),
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.center}> 
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ ...styles.content, paddingTop: insets.top }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor="#2E86AB" colors={["#2E86AB"]} />}>
        <Text style={styles.title}>Your Progress</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Exercises</Text>
          <View style={styles.row}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{exerciseProgress?.totalSessions ?? 0}</Text>
              <Text style={styles.statLabel}>Total Sessions</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{Math.round(exerciseProgress?.averageScore ?? 0)}</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{exerciseProgress?.streak ?? 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {(exerciseHistory ?? []).slice(0, 5).map((s) => (
            <View key={s.id} style={styles.listItem}>
              <Text style={styles.listTitle}>{s.exerciseId}</Text>
              <Text style={styles.listMeta}>{new Date(s.completedAt).toLocaleDateString()}</Text>
              {s.score != null && <Text style={styles.listBadge}>{s.score}</Text>}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tests</Text>
          <View style={styles.row}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{testProgress?.totalTests ?? 0}</Text>
              <Text style={styles.statLabel}>Tests Taken</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{Math.round(testProgress?.averageScore ?? 0)}%</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{(testHistory ?? []).length}</Text>
              <Text style={styles.statLabel}>Recent</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recent Results</Text>
          {(testHistory ?? []).slice(0, 5).map((t) => (
            <View key={t.id} style={styles.listItem}>
              <Text style={styles.listTitle}>{t.testId}</Text>
              <Text style={styles.listMeta}>{new Date(t.completedAt).toLocaleDateString()}</Text>
              <Text style={styles.listBadge}>{Math.round(t.percentage)}%</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 12, color: "#666" },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12, color: "#1A1A1A" },
  card: { backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12, color: "#1A1A1A" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  statBox: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "700", color: "#2E86AB" },
  statLabel: { fontSize: 12, color: "#666" },
  sectionTitle: { marginTop: 8, marginBottom: 8, fontSize: 14, fontWeight: "600", color: "#333" },
  listItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  listTitle: { fontSize: 14, color: "#1A1A1A", flex: 1 },
  listMeta: { fontSize: 12, color: "#666", marginHorizontal: 8 },
  listBadge: { fontSize: 12, color: "#2E86AB", fontWeight: "700" },
});
