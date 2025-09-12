import { useAuth } from "@/hooks/useAuth";
import { Href, Link, Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

/**
 * 
 * model User {
  id                String               @id @default(cuid())
  fullname          String
  email             String               @unique
  phone             String?              @unique
  passwordHash      String
  dateRegistered    DateTime             @default(now())
  age               Int?
  eyeConditions     String[]             @default([])
  preferences       Json?
  chatConversations Conversation[]
  chatMessages      ChatMessage[]
  scans             Scan[]
  exercises         ExerciseCompletion[]
  tests             EyeTestResult[]
  refreshTokens     RefreshToken[]
  reminders         Reminder[]
  deletedAt         DateTime?
}
*/

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert("Missing fields", "Please enter name, email and password.");
      return;
    }
    try {
      setIsSubmitting(true);
      await signUp(email.trim(), password, name.trim(), phone.trim());
      router.replace("/(tabs)");
    } catch (e) {
      Alert.alert("Registration failed", "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Create Account" }} />
      <Text style={styles.title}>Create your account</Text>
      <TextInput
        placeholder="Full Name"
        placeholderTextColor="#666"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        placeholderTextColor="#666"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Phone"
        autoCapitalize="none"
        placeholderTextColor="#666"
        keyboardType="number-pad"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? "Creating..." : "Sign Up"}</Text>
      </TouchableOpacity>
      <View style={styles.bottomRow}>
        <Text>Already have an account? </Text>
        <Link href={"/(auth)/login" as Href} style={styles.link}>Sign in</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
    color: "#1A1A1A",
  },
  button: {
    backgroundColor: "#2E86AB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "white", fontWeight: "700" },
  bottomRow: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  link: { color: "#2E86AB", fontWeight: "600" },
});
