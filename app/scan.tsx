import { useUploadScan } from "@/hooks/useApi";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Stack, router } from "expo-router";
import { Camera, Flashlight, RefreshCw, Upload, X } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const cameraRef = useRef<CameraView>(null);
  
  // API hook
  const uploadScanMutation = useUploadScan();

  const analyzeImage = async (imageUri: string) => {
    setIsAnalyzing(true);
    try {
      const scan = await uploadScanMutation.mutateAsync(imageUri);
      console.log(scan);
      router.push({ pathname: "/scan-result", params: { scanId: scan.id, analysis: scan.aiSummary, url: scan.url || '' } });
    } catch (error) {
      console.error("Analysis error:", error);
      Alert.alert("Error", "Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const takePicture = async () => {
    try {
      const cam = cameraRef.current as any;
      if (cam && typeof cam.takePictureAsync === 'function') {
        const photo = await cam.takePictureAsync({ quality: 1, skipProcessing: true });
        if (photo?.uri) {
          await analyzeImage(photo.uri);
          return;
        }
      }
      // Fallback to picker if camera ref not ready
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 1 });
      if (!result.canceled && result.assets[0]) await analyzeImage(result.assets[0].uri);
    } catch (e) {
      Alert.alert("Error", "Could not capture image.");
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!result.canceled && result.assets[0]) await analyzeImage(result.assets[0].uri);
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Eye Scan", headerShown: true }} />
        <View style={styles.permissionContainer}>
          <Camera color="#2E86AB" size={64} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>We need access to your camera to capture eye images for analysis</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isAnalyzing) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Analyzing...", headerShown: true }} />
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.analyzingTitle}>Analyzing Your Eye Image</Text>
          <Text style={styles.analyzingText}>Our AI is examining your image for potential eye conditions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const canUseTorch = facing === 'back';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Eye Scan",
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X color="#1A1A1A" size={24} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          { ...({ torch: canUseTorch && torchOn ? 'on' : 'off' } as any) }
        >
          <View style={styles.overlay}>
            <View style={styles.guidanceContainer}>
              <Text style={styles.guidanceTitle}>Position Your Eye</Text>
              <Text style={styles.guidanceText}>Center your eye in the frame and ensure good lighting</Text>
            </View>
            <View style={styles.frameGuide} />
            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlButton} onPress={pickFromGallery}>
                <Upload color="#FFFFFF" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <Camera color="#FFFFFF" size={32} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={() => setFacing(p => (p === 'back' ? 'front' : 'back'))}>
                <RefreshCw color="#FFFFFF" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.controlButton, !canUseTorch && { opacity: 0.4 }]} disabled={!canUseTorch} onPress={() => setTorchOn(v => !v)}>
                <Flashlight color="#FFFFFF" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
      
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Instructions</Text>
        <Text style={styles.instructionsText}>
          • Ensure good lighting conditions{"\n"}
          • Keep your eye open and look straight{"\n"}
          • Hold the device steady{"\n"}
          • Capture a clear, focused image{"\n"}
          • Our AI will analyze the image for potential conditions
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  permissionContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#FFFFFF" },
  permissionTitle: { fontSize: 24, fontWeight: "bold", color: "#1A1A1A", marginTop: 24, marginBottom: 12 },
  permissionText: { fontSize: 16, color: "#666666", textAlign: "center", lineHeight: 24, marginBottom: 32 },
  permissionButton: { backgroundColor: "#2E86AB", paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  permissionButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  analyzingContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#FFFFFF" },
  analyzingTitle: { fontSize: 24, fontWeight: "bold", color: "#1A1A1A", marginTop: 24, marginBottom: 12 },
  analyzingText: { fontSize: 16, color: "#666666", textAlign: "center", lineHeight: 24 },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "space-between", padding: 24 },
  guidanceContainer: { alignItems: "center", marginTop: 40 },
  guidanceTitle: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginBottom: 8 },
  guidanceText: { fontSize: 14, color: "#FFFFFF", textAlign: "center", opacity: 0.8 },
  frameGuide: { width: 200, height: 200, borderRadius: 100, borderWidth: 3, borderColor: "#FFFFFF", alignSelf: "center", opacity: 0.8 },
  controls: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 40, gap: 12 },
  controlButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.3)", justifyContent: "center", alignItems: "center" },
  captureButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#2E86AB", justifyContent: "center", alignItems: "center" },
  instructions: { backgroundColor: "#FFFFFF", padding: 24 },
  instructionsTitle: { fontSize: 18, fontWeight: "600", color: "#1A1A1A", marginBottom: 12 },
  instructionsText: { fontSize: 14, color: "#666666", lineHeight: 20 },
});
