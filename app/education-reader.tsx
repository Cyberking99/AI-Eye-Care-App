import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import MarkdownDisplay from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";

// Markdown styles, similar to bot.tsx
const markdownStyles = StyleSheet.create({
  heading1: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 24,
    color: "#1A1A1A",
  },
  heading2: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 20,
    color: "#1A1A1A",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    paddingBottom: 8,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333333",
  },
  link: {
    color: "#2E86AB",
    textDecorationLine: "underline",
  },
  list_item: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 8,
  },
  bullet_list_icon: {
    fontSize: 16,
    lineHeight: 24,
    marginRight: 8,
    color: "#2E86AB",
  },
});

const Markdown = ({ children }: { children: string }) => {
  return (
    <MarkdownDisplay
      style={markdownStyles}
      rules={{
        link: (node, children, parent, styles) => (
          <Text
            key={node.key}
            style={styles.link}
            onPress={() => Linking.openURL(node.attributes.href)}
          >
            {children}
          </Text>
        ),
      }}
    >
      {children}
    </MarkdownDisplay>
  );
};

export default function EducationReaderScreen() {
  const { title, author, content, publishedAt } = useLocalSearchParams<{
    title: string;
    author: string;
    content: string;
    publishedAt: string;
  }>();

  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Article", headerBackTitle: "Back" }} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.author}>By {author}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        <View style={styles.divider} />
        {content ? (
          <Markdown>{content}</Markdown>
        ) : (
          <Text style={styles.errorText}>Content not available.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  contentContainer: { padding: 24 },
  title: { fontSize: 28, fontWeight: "bold", color: "#1A1A1A", marginBottom: 12 },
  metaContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  author: { flex: 1, fontSize: 14, color: "#666666", fontWeight: "500", marginRight: 8 },
  date: { fontSize: 12, color: "#999999" },
  divider: { height: 1, backgroundColor: "#E5E5EA", marginBottom: 16 },
  errorText: { fontSize: 16, color: "#666666", textAlign: "center", marginTop: 40 },
});