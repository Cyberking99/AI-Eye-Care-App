import { useSubmitTest } from "@/hooks/useApi";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TestRunScreen() {
  const params = useLocalSearchParams<{ id: string; name: string; type: string; config: string }>();
  const submitTest = useSubmitTest();

  const config = useMemo(() => {
    try { return params.config ? JSON.parse(params.config as string) : {}; } catch { return {}; }
  }, [params.config]);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);

  const type = String(params.type || '').toUpperCase();

  const handleAnswer = (answer: any) => {
    setAnswers((prev) => [...prev, answer]);
    setStep((s) => s + 1);
  };

  const finish = async () => {
    try {
      await submitTest.mutateAsync({ testId: params.id as string, answers });
      Alert.alert('Submitted', 'Your result has been recorded.');
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to submit result.');
    }
  };

  const renderVisualAcuity = () => {
    const line = config.lines?.[step] || '';
    const done = step >= (config.lines?.length || 0);
    if (done) return renderDone();
    return (
      <View style={styles.block}>
        <Text style={styles.big}>{line}</Text>
        <Text style={styles.caption}>Read the letters above. Tap &quot;Correct&quot; if you could read them clearly, otherwise &quot;Skip&quot;.</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.primary} onPress={() => handleAnswer({ line, correct: true })}><Text style={styles.primaryText}>Correct</Text></TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={() => handleAnswer({ line, correct: false })}><Text style={styles.secondaryText}>Skip</Text></TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderColorBlindness = () => {
    const plate = config.plates?.[step];
    const done = step >= (config.plates?.length || 0);
    if (done) return renderDone();
    return (
      <View style={styles.block}>
        <Text style={styles.big}>Plate #{step + 1}</Text>
        <Text style={styles.caption}>Enter the number you see (or tap &quot;Can&apos;t see&quot;).</Text>
        <View style={styles.row}>
          {[plate?.answer, ''].filter((v) => v !== undefined).slice(0, 1).map((ans: any, idx: number) => (
            <TouchableOpacity key={idx} style={styles.primary} onPress={() => handleAnswer({ plate: step + 1, value: ans })}><Text style={styles.primaryText}>{String(ans)}</Text></TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.secondary} onPress={() => handleAnswer({ plate: step + 1, value: null })}><Text style={styles.secondaryText}>Can&apos;t see</Text></TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderContrast = () => {
    const level = config.levels?.[step];
    const done = step >= (config.levels?.length || 0);
    if (done) return renderDone();
    return (
      <View style={styles.block}>
        <Text style={[styles.big, { opacity: (Number(level) || 100) / 100 }]}>E</Text>
        <Text style={styles.caption}>Tap &quot;Visible&quot; if you can see the letter at this contrast level.</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.primary} onPress={() => handleAnswer({ level, visible: true })}><Text style={styles.primaryText}>Visible</Text></TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={() => handleAnswer({ level, visible: false })}><Text style={styles.secondaryText}>Not visible</Text></TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDone = () => (
    <View style={styles.block}>
      <Text style={styles.big}>Done</Text>
      <Text style={styles.caption}>You completed the test. Submit your answers.</Text>
      <TouchableOpacity style={styles.primary} onPress={finish}><Text style={styles.primaryText}>Submit</Text></TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (type === 'VISUAL_ACUITY') return renderVisualAcuity();
    if (type === 'COLOR_BLINDNESS') return renderColorBlindness();
    if (type === 'CONTRAST_SENSITIVITY') return renderContrast();
    return renderDone();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: params.name || 'Test', headerShown: true }} />
      <View style={styles.header}>
        <Text style={styles.subtitle}>Follow the steps below and respond as best as you can.</Text>
      </View>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 16 },
  subtitle: { color: '#666', fontSize: 14 },
  block: { padding: 24, alignItems: 'center' },
  big: { fontSize: 48, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
  caption: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  primary: { backgroundColor: '#2E86AB', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  primaryText: { color: '#fff', fontWeight: '600' },
  secondary: { backgroundColor: '#F0F0F0', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  secondaryText: { color: '#1A1A1A', fontWeight: '600' },
});
