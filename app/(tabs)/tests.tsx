import { useTestHistory, useTestProgress, useTests } from "@/hooks/useApi";
import { router } from "expo-router";
import { Clock, Contrast, Eye, Palette, TrendingUp } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function TestsScreen() {
  const insets = useSafeAreaInsets();
  const { data: tests, isLoading: isLoadingTests, refetch: refetchTests, isRefetching: isRefetchingTests } = useTests();
  const { data: testHistory, isLoading: isLoadingHistory, refetch: refetchHistory, isRefetching: isRefetchingHistory } = useTestHistory();
  const { data: testProgress, isLoading: isLoadingProgress, refetch: refetchProgress, isRefetching: isRefetchingProgress } = useTestProgress();

  const isLoading = isLoadingTests || isLoadingHistory || isLoadingProgress;
  const refreshing = isRefetchingTests || isRefetchingHistory || isRefetchingProgress;

  const onRefresh = async () => {
    await Promise.all([
      refetchTests(),
      refetchHistory(),
      refetchProgress(),
    ]);
  };

  const getTestIcon = (type: string) => {
    switch ((type || '').toUpperCase()) {
      case 'VISUAL_ACUITY':
        return Eye;
      case 'COLOR_BLINDNESS':
        return Palette;
      case 'CONTRAST_SENSITIVITY':
        return Contrast;
      default:
        return Eye;
    }
  };

  const getTestColor = (type: string) => {
    switch ((type || '').toUpperCase()) {
      case 'VISUAL_ACUITY':
        return "#2E86AB";
      case 'COLOR_BLINDNESS':
        return "#A8DADC";
      case 'CONTRAST_SENSITIVITY':
        return "#457B9D";
      default:
        return "#2E86AB";
    }
  };

  const getTypeLabel = (type: string) => (type || '').replace(/_/g, ' ').toUpperCase();

  const defaultDescription = (type: string) => {
    const t = (type || '').toUpperCase();
    if (t === 'VISUAL_ACUITY') return 'Test your ability to read letters at distance (Snellen-like).';
    if (t === 'COLOR_BLINDNESS') return 'Identify numbers on Ishihara color plates.';
    if (t === 'CONTRAST_SENSITIVITY') return 'Read letters as contrast decreases.';
    if (t === 'ASTIGMATISM') return 'Check for distortion using a fan-and-block pattern.';
    return 'Vision test';
  };

  const handleTestPress = (test: any) => {
    router.push({
      pathname: "/test/run",
      params: {
        id: test.id,
        name: test.name,
        type: test.type,
        config: JSON.stringify(test.config || {}),
      },
    } as any);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.loadingText}>Loading tests...</Text>
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
        <Text style={styles.title}>Vision Tests</Text>
        <Text style={styles.subtitle}>
          Regular testing helps monitor your eye health
        </Text>
        
        {testProgress && (
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{testProgress.totalTests}</Text>
                <Text style={styles.statLabel}>Tests Taken</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(testProgress.averageScore)}%</Text>
                <Text style={styles.statLabel}>Average Score</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.trendContainer}>
                  <TrendingUp size={16} color="#4CAF50" />
                  <Text style={[styles.trendText, { color: '#4CAF50' }]}>
                    {testProgress.improvementTrend}
                  </Text>
                </View>
                <Text style={styles.statLabel}>Trend</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2E86AB"
            colors={["#2E86AB"]}
          />
        }
        contentContainerStyle={{ paddingTop: insets.top }}
      >
        {tests?.map((test) => {
          const IconComponent = getTestIcon((test as any).type);
          const color = getTestColor((test as any).type);
          const typeLabel = getTypeLabel((test as any).type);
          
          return (
            <TouchableOpacity
              key={test.id}
              style={styles.testCard}
              onPress={() => handleTestPress(test)}
              activeOpacity={0.8}
            >
              <View style={[styles.testIcon, { backgroundColor: color }]}>
                <IconComponent color="#FFFFFF" size={24} />
              </View>
              <View style={styles.testContent}>
                <Text style={styles.testTitle}>{(test as any).name}</Text>
                <Text style={styles.testDescription}>{defaultDescription((test as any).type)}</Text>
                <View style={styles.testMeta}>
                  <Clock color="#666666" size={14} />
                  <Text style={styles.testDuration}>~ 2-5 min</Text>
                </View>
                <Text style={styles.testType}>{typeLabel}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {testHistory && testHistory.length > 0 && (
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Recent Results</Text>
            <View style={styles.row}>
              <Text style={styles.listTitleHeader}>Name</Text>
              <Text style={styles.listMetaHeader}>Date</Text>
              <Text style={styles.listBadgeHeader}>Score</Text>
            </View>
            {testHistory.slice(0, 3).map((result) => (
              <View key={result.id} style={styles.historyItem}>
                <Text style={styles.historyTestName}>{result.template.name}</Text>
                <Text style={styles.historyScore}>{result.score}%</Text>
                <Text style={styles.historyDate}>
                  {new Date(result.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Before You Start</Text>
          <Text style={styles.infoText}>
            • Ensure good lighting conditions{"\n"}
            • Hold your device at arm&apos;s length{"\n"}
            • Cover one eye when instructed{"\n"}
            • Take breaks between tests{"\n"}
            • Test regularly to track changes
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
    marginBottom: 100,
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
  },
  progressTitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F8F9FA",
  },
  testCard: {
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
  testIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  testContent: {
    flex: 1,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  testMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  testDuration: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 4,
  },
  testType: {
    fontSize: 10,
    color: "#999999",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyTestName: {
    fontSize: 14,
    color: "#1A1A1A",
    flex: 1,
  },
  historyScore: {
    fontSize: 14,
    fontWeight: '600',
    color: "#2E86AB",
    marginHorizontal: 12,
  },
  historyDate: {
    fontSize: 12,
    color: "#666666",
  },
  infoCard: {
    backgroundColor: "#E3F2FD",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  listTitleHeader: { fontSize: 14, color: "#1A1A1A", flex: 1, fontWeight: "bold" },
  listMetaHeader: { fontSize: 14, color: "#1A1A1A", marginHorizontal: 12, fontWeight: "bold" },
  listBadgeHeader: { fontSize: 14, color: "#1A1A1A", fontWeight: "bold" },
});
