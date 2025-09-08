import { useChatHistory, useSendMessage } from "@/hooks/useApi";
import { ChatMessage } from "@/services/api";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Linking, Platform, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MarkdownDisplay from 'react-native-markdown-display';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const markdownStyles = StyleSheet.create({
  link: {
    color: '#007AFF', // A standard link color
    textDecorationLine: 'underline',
  },
});

const Markdown = ({ children, style }: { children: string, style?: object }) => {
  return (
    <MarkdownDisplay
      style={{...markdownStyles, ...style}}
      rules={{
        link: (node: any, children: any, parent: any, styles: any) => (
          <Text key={node.key} style={styles.link} onPress={() => Linking.openURL(node.attributes.href)}>
            {children}
          </Text>
        ),
      }}>{children}</MarkdownDisplay>
  );
};

export default function BotScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const [sending, setSending] = useState(false);

  // API hooks
  const { data: chatHistory, isLoading: isLoadingHistory, refetch: refetchHistory, isRefetching } = useChatHistory();
  const sendMessageMutation = useSendMessage();

  // Load chat history on mount
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      // Load the most recent conversation
      const recentConversation = chatHistory[0];
      setMessages(recentConversation.messages);
      setCurrentConversationId(recentConversation.id);
    } else if (!isLoadingHistory) {
      // Show welcome message if no history
      setMessages([
        { 
          id: "welcome", 
          role: "assistant", 
          content: "Hi! I'm your EyeCare assistant. Ask me about eye exercises, tests, or scan guidance.",
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [chatHistory, isLoadingHistory]);

  const onRefresh = async () => {
    await refetchHistory();
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
      conversationId: currentConversationId
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    const messageText = input.trim();
    setInput("");
    setSending(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        message: messageText,
        conversationId: currentConversationId
      });

      // Add assistant response
      setMessages(prev => [...prev, response.message]);
      
      // Update conversation ID if this is a new conversation
      if (!currentConversationId) {
        setCurrentConversationId(response.conversationId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      
      // Remove the user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setSending(false);
    }
  };

  if (isLoadingHistory) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading chat history...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: "height" })}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <FlatList
          style={{ flex: 1, padding: 16 }}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === "user" ? styles.user : styles.assistant]}>
              {item.role === "user" ? (
                <Text style={styles.userText}>{item.content}</Text>
              ) : (
                <Markdown style={{ body: styles.assistantText }}>{item.content as string}</Markdown>
              )}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 96 }}
          refreshControl={
            <RefreshControl
              refreshing={!!isRefetching}
              onRefresh={onRefresh}
              tintColor="#2E86AB"
              colors={["#2E86AB"]}
            />
          }
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask about tests, exercises, or scans..."
            value={input}
            onChangeText={setInput}
            editable={!sending}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={sending || !input.trim()}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>{sending ? "..." : "Send"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#F7F7F7",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 8,
    minHeight: 44,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#2E86AB",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    height: 44,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  user: {
    alignSelf: "flex-end",
    backgroundColor: "#2E86AB",
  },
  assistant: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F4FA",
  },
  userText: { color: "#fff" },
  assistantText: { color: "#1C1C1E" },
});
