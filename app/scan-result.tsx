import { scansService } from "@/services/api";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { AlertTriangle, ArrowRight, CheckCircle, Info } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScanResultsScreen() {
  const { scanId, analysis: analysisParam, findings: findingsParam, urlParam: urlParam } = useLocalSearchParams<{ scanId?: string; analysis?: string; findings?: string; urlParam?: string }>();
  const [scan, setScan] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(!!scanId);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!scanId) return;
    try {
      setLoading(true);
      const s = await scansService.getScan(scanId);
      console.log("Loaded scan:", s);
      setScan(s);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [scanId]);

  const onRefresh = async () => { if (!scanId) return; setRefreshing(true); await load(); setRefreshing(false); };

  const structuredFromParam = useMemo(() => {
    if (!analysisParam || !findingsParam) return null;
    try { 
      const parsed = JSON.parse(findingsParam);
      console.log("Parsed analysis param:", parsed);
      return parsed;
    } catch (error) {
      console.error("Failed to parse analysis param:", error);
      return null;
    }
  }, [analysisParam, findingsParam]);

  const analysis = useMemo(() => {
    // Priority: scan.aiSummary > structuredFromParam.summary > analysisParam as string
    if (scan?.aiSummary && typeof scan.aiSummary === 'string') {
      return scan.aiSummary;
    }
    if (structuredFromParam?.summary && typeof structuredFromParam.summary === 'string') {
      return structuredFromParam.summary;
    }
    if (analysisParam && typeof analysisParam === 'string') {
      // Try to extract summary from JSON string
      try {
        const parsed = JSON.parse(analysisParam);
        return parsed.summary || analysisParam;
      } catch {
        return analysisParam;
      }
    }
    return "";
  }, [scan, structuredFromParam, analysisParam]);
  
  const findings = useMemo(() => {
    // Priority: scan.aiFindings.findings > scan.aiFindings (if array) > structuredFromParam.findings
    const aiFindings = scan?.aiFindings;
    
    if (aiFindings) {
      // Check if aiFindings has a findings property (new structure)
      if (typeof aiFindings === 'object' && Array.isArray(aiFindings.findings)) {
        return aiFindings.findings;
      }
      // Check if aiFindings is directly an array (old structure)
      if (Array.isArray(aiFindings)) {
        return aiFindings;
      }
    }
    
    // Fallback to structured param
    if (structuredFromParam?.findings && Array.isArray(structuredFromParam.findings)) {
      return structuredFromParam.findings;
    }
    
    return [];
  }, [scan, structuredFromParam]);
  
  const recommendations = useMemo(() => {
    // Priority: scan.aiFindings.recommendations > structuredFromParam.recommendations
    const aiFindings = scan?.aiFindings;
    
    if (aiFindings && typeof aiFindings === 'object' && Array.isArray(aiFindings.recommendations)) {
      return aiFindings.recommendations;
    }
    
    if (structuredFromParam?.recommendations && Array.isArray(structuredFromParam.recommendations)) {
      return structuredFromParam.recommendations;
    }
    
    return [];
  }, [scan, structuredFromParam]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "#FF5722";
      case "medium": return "#FF9800";
      case "low": return "#4CAF50";
      default: return "#2E86AB";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high": return AlertTriangle;
      case "medium": return Info;
      case "low": return CheckCircle;
      default: return Info;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Scan Results", headerShown: true }} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E86AB" colors={["#2E86AB"]} />}>
        
        <View style={styles.statusCard}>
          <CheckCircle color="#4CAF50" size={32} />
          <Text style={styles.statusTitle}>Overall Eye Health</Text>
          <Text style={styles.statusValue}>{findings.length === 0 ? "Good" : "Review Findings"}</Text>
          <Text style={styles.statusDescription}>Based on AI analysis of your eye image</Text>
        </View>

        {scan?.url && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: scan.url }} style={styles.scanImage} />
          </View>
        )}

        {findings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analysis Results</Text>
            {findings.map((f: any, index: number) => {
              const sev = String(f.severity || '').toLowerCase();
              const SeverityIcon = getSeverityIcon(sev);
              const color = getSeverityColor(sev);
              return (
                <View key={index} style={styles.conditionCard}>
                  <View style={styles.conditionHeader}>
                    <SeverityIcon color={color} size={24} />
                    <View style={styles.conditionInfo}>
                      <Text style={styles.conditionName}>{f.name || 'Finding'}</Text>
                      <Text style={styles.confidenceScore}>Confidence: {Math.round(Number(f.confidence || 0))}%</Text>
                    </View>
                  </View>
                  {!!f.description && (<Text style={styles.conditionDescription}>{f.description}</Text>)}
                </View>
              );
            })}
          </View>
        )}

        {!!analysis && (
          <View className="section">
            <Text style={styles.sectionTitle}>AI Summary</Text>
            <View style={styles.analysisCard}><Text style={styles.analysisText}>{analysis}</Text></View>
          </View>
        )}

        {recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {recommendations.map((recommendation: any, index: any) => (
              <View key={index} style={styles.recommendationItem}>
                <View style={styles.recommendationBullet} />
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/tests")}>
            <Text style={styles.primaryButtonText}>Take Vision Test</Text>
            <ArrowRight color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/scan")}>
            <Text style={styles.secondaryButtonText}>Scan Another Image</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}><Text style={styles.disclaimerBold}>Important:</Text> This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with an eye care professional for proper diagnosis and treatment.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  content: { flex: 1, padding: 24 },
  imageContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E5EA',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scanImage: { width: '100%', height: 250, resizeMode: 'cover' },
  statusCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  statusTitle: { fontSize: 16, color: "#666666", marginTop: 12, marginBottom: 4 },
  statusValue: { fontSize: 24, fontWeight: "bold", color: "#1A1A1A", marginBottom: 8 },
  statusDescription: { fontSize: 14, color: "#666666", textAlign: "center" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#1A1A1A", marginBottom: 16 },
  conditionCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  conditionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  conditionInfo: { flex: 1, marginLeft: 12 },
  conditionName: { fontSize: 16, fontWeight: "600", color: "#1A1A1A", marginBottom: 4 },
  confidenceScore: { fontSize: 12, color: "#666666" },
  conditionDescription: { fontSize: 14, color: "#666666", lineHeight: 20 },
  analysisCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  analysisText: { fontSize: 14, color: "#666666", lineHeight: 20 },
  recommendationItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  recommendationBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#2E86AB", marginTop: 6, marginRight: 12 },
  recommendationText: { flex: 1, fontSize: 14, color: "#666666", lineHeight: 20 },
  actions: { marginBottom: 24 },
  primaryButton: { backgroundColor: "#2E86AB", borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600", marginRight: 8 },
  secondaryButton: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#E5E5EA" },
  secondaryButtonText: { color: "#2E86AB", fontSize: 16, fontWeight: "600" },
  disclaimer: { backgroundColor: "#FFF3E0", borderRadius: 12, padding: 16, marginBottom: 32 },
  disclaimerText: { fontSize: 12, color: "#666666", lineHeight: 18 },
  disclaimerBold: { fontWeight: "600", color: "#1A1A1A" },
});