import { useEducationResources } from "@/hooks/useApi";
import { Stack, router } from "expo-router";
import { Book, Globe, Newspaper } from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Linking,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// This is the expected shape of an item from the API
type EducationResource = {
  id: string;
  type: "book" | "journal" | "article";
  title: string;
  author: string;
  summary: string;
  coverImageUrl?: string;
  url: string;
  content?: string;
  publishedAt: string;
};

export default function EducationScreen() {
  const {
    data: resources,
    isLoading,
    refetch,
    isRefetching,
  } = useEducationResources();

  const handlePress = (item: EducationResource) => {
    // If it's an article with content, open it in-app
    if (item.type === "article" && item.content) {
      router.push({
        pathname: "/education-reader",
        params: {
          title: item.title,
          author: item.author,
          content: item.content,
          publishedAt: item.publishedAt,
        },
      });
    } else {
      // Otherwise, open the URL in a browser
      Linking.canOpenURL(item.url).then((supported) => {
        if (supported) {
          Linking.openURL(item.url);
        } else {
          console.log(`Don't know how to open URL: ${item.url}`);
          Alert.alert("Error", `Unable to open this ${item.type}.`);
        }
      });
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "book":
        return <Book color="#fff" size={20} />;
      case "journal":
        return <Newspaper color="#fff" size={20} />;
      case "article":
        return <Globe color="#fff" size={20} />;
      default:
        return <Book color="#fff" size={20} />;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E86AB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Education & Resources" }} />
      <FlatList
        data={resources || []}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#2E86AB"
            colors={["#2E86AB"]}
          />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Learn About Eye Health</Text>
            <Text style={styles.subtitle}>
              Explore curated books, journals, and articles to stay informed.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handlePress(item)}
            activeOpacity={0.8}
          >
            {item.coverImageUrl ? (
              <Image source={{ uri: item.coverImageUrl }} style={styles.cardImage} />
            ) : (
              <View style={styles.cardIconContainer}>
                {getIconForType(item.type)}
              </View>
            )}
            <View style={styles.cardContent}>
              <Text style={styles.cardType}>{item.type.toUpperCase()}</Text>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.cardAuthor}>by {item.author}</Text>
              <Text style={styles.cardSummary} numberOfLines={3}>{item.summary}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No resources found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "bold", color: "#1A1A1A", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666666" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, marginBottom: 16, flexDirection: "row", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  cardImage: { width: 100, height: "100%", backgroundColor: "#E5E5EA" },
  cardIconContainer: { width: 100, backgroundColor: "#A8DADC", justifyContent: "center", alignItems: "center" },
  cardContent: { flex: 1, padding: 16 },
  cardType: { fontSize: 10, fontWeight: "bold", color: "#2E86AB", marginBottom: 4, letterSpacing: 0.5 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#1A1A1A", marginBottom: 4 },
  cardAuthor: { fontSize: 12, color: "#666666", marginBottom: 8 },
  cardSummary: { fontSize: 12, color: "#666666", lineHeight: 18 },
});