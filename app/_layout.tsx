import { AuthProvider } from "@/hooks/useAuth";
import { EyeHealthProvider } from "@/hooks/useEyeHealth";
import { QueryProvider } from "@/hooks/useQueryProvider";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="scan" options={{ presentation: "modal" }} />
      <Stack.Screen name="scan-result" options={{ presentation: "modal" }} />
      <Stack.Screen name="scans" />
      <Stack.Screen name="test/[testType]" options={{ presentation: "modal" }} />
      <Stack.Screen name="education" />
      <Stack.Screen name="education-reader" options={{ presentation: "modal" }} />
      <Stack.Screen name="exercise/[exerciseType]" options={{ presentation: "modal" }} />
      <Stack.Screen name="exercise/run" options={{ presentation: "modal" }} />
      <Stack.Screen name="test/run" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryProvider>
      <AuthProvider>
        <EyeHealthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </EyeHealthProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
