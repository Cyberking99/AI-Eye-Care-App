import { useScans } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { scansService } from "@/services/api";
import { Stack, router } from "expo-router";
import React from "react";
import { Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScansScreen() {
  const { user } = useAuth();
  const userId = user?.id || "";
  const { data: scans, refetch, isRefetching } = useScans(userId);

  const onDelete = (id: string) => {
    Alert.alert("Delete Scan", "Are you sure you want to delete this scan?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await scansService.deleteScan(id);
            refetch();
          } catch (e) {
            Alert.alert("Error", "Failed to delete scan.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "My Scans", headerShown: true }} />
      <FlatList
        contentContainerStyle={styles.listContent}
        data={scans || []}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={!!isRefetching} onRefresh={refetch} tintColor="#2E86AB" colors={["#2E86AB"]} />}
        ListEmptyComponent={<Text style={styles.empty}>No scans yet. Upload one from Eye Scan.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: "/scan-result", params: { scanId: item.id, analysis: item.aiSummary || '' } })}
          >
            <Image source={{ uri: (item as any).url || (item as any).imageUrl }} style={styles.thumb} />
            <View style={styles.meta}>
              <Text style={styles.title}>{new Date(item.createdAt).toLocaleString()}</Text>
              <Text style={styles.subtitle} numberOfLines={2}>{item.aiSummary || "Tap to view analysis"}</Text>
              <View style={styles.row}>
                <TouchableOpacity style={styles.link} onPress={() => router.push({ pathname: "/scan-result", params: { scanId: item.id, analysis: item.aiSummary || '' } })}>
                  <Text style={styles.linkText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.link, styles.danger]} onPress={() => onDelete(item.id)}>
                  <Text style={[styles.linkText, styles.dangerText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  listContent: { padding: 16 },
  empty: { textAlign: "center", color: "#666", marginTop: 32 },
  card: { flexDirection: "row", backgroundColor: "#FFF", borderRadius: 12, overflow: "hidden", marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  thumb: { width: 96, height: 96, backgroundColor: "#EEE" },
  meta: { flex: 1, padding: 12 },
  title: { fontSize: 14, fontWeight: "600", color: "#1A1A1A", marginBottom: 4 },
  subtitle: { fontSize: 12, color: "#666" },
  row: { flexDirection: "row", marginTop: 8, gap: 12 },
  link: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: "#E8F4FA" },
  linkText: { color: "#2E86AB", fontWeight: "600" },
  danger: { backgroundColor: "#FFEBEE" },
  dangerText: { color: "#D32F2F" },
}); 