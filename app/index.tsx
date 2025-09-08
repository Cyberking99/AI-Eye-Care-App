import { useAuth } from "@/hooks/useAuth";
import { Href, Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

export default function IndexRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href={"/(auth)/login" as Href} />;
  }

  return <Redirect href={"/(tabs)" as Href} />;
} 