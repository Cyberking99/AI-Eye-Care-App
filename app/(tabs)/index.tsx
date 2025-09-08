import { useEyeHealth } from "@/hooks/useEyeHealth";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { BookOpen, Camera, Dumbbell, TestTube, TrendingUp } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const { user, recentTests, todayExercises, isLoading } = useEyeHealth();
  const insets = useSafeAreaInsets();
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const quickActions = [
    {
      id: "scan",
      title: "Eye Scan",
      subtitle: "AI-powered analysis",
      icon: Camera,
      color: "#2E86AB",
      onPress: () => router.push("/scan"),
    },
    {
      id: "test",
      title: "Vision Test",
      subtitle: "Check your vision",
      icon: TestTube,
      color: "#A8DADC",
      onPress: () => router.push("/tests"),
    },
    {
      id: "exercise",
      title: "Eye Exercises",
      subtitle: "Daily routine",
      icon: Dumbbell,
      color: "#457B9D",
      onPress: () => router.push("/exercises"),
    },
    {
      id: "progress",
      title: "Progress",
      subtitle: "Track improvements",
      icon: TrendingUp,
      color: "#F1FAEE",
      onPress: () => router.push("/progress"),
    },
  ];

  return (
    <LinearGradient
      colors={["#F1FAEE", "#A8DADC"]}
      style={styles.container}
    >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: insets.top }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>{greeting}!</Text>
            <Text style={styles.userName}>{user?.fullname || "User"}</Text>
            <Text style={styles.subtitle}>{isLoading ? "Loading..." : "How are your eyes feeling today?"}</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionCard}
                  onPress={action.onPress}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                    <action.icon color="#FFFFFF" size={24} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Today's Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today&apos;s Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <View style={styles.summaryIcon}>
                  <TestTube color="#2E86AB" size={20} />
                </View>
                <View style={styles.summaryText}>
                  <Text style={styles.summaryValue}>{recentTests.length}</Text>
                  <Text style={styles.summaryLabel}>Tests Completed</Text>
                </View>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <View style={styles.summaryIcon}>
                  <Dumbbell color="#457B9D" size={20} />
                </View>
                <View style={styles.summaryText}>
                  <Text style={styles.summaryValue}>{todayExercises}</Text>
                  <Text style={styles.summaryLabel}>Exercises Done</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Eye Health Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Eye Health Tips</Text>
            <TouchableOpacity style={styles.tipCard} activeOpacity={0.8}>
              <View style={styles.tipIcon}>
                <BookOpen color="#2E86AB" size={20} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>20-20-20 Rule</Text>
                <Text style={styles.tipDescription}>
                  Every 20 minutes, look at something 20 feet away for 20 seconds
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: (width - 64) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  summaryText: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666666",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 16,
  },
  tipCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
});