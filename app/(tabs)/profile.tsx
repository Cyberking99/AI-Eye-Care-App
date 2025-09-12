import { useExerciseProgress, useProfile, useTestProgress, useUpdateProfile } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";
import { BookOpen, Camera, Dumbbell, Edit3, History, LogOut, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const { data: profile, isLoading: isLoadingProfile, refetch: refetchProfile, isRefetching: isRefetchingProfile } = useProfile();
  const { data: testProgress, refetch: refetchTestProgress, isRefetching: isRefetchingTestProgress } = useTestProgress();
  const { data: exerciseProgress, refetch: refetchExerciseProgress, isRefetching: isRefetchingExerciseProgress } = useExerciseProgress();
  const updateProfileMutation = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState((profile as any)?.fullname || "");

  const onRefresh = () => {
    refetchProfile();
    refetchTestProgress();
    refetchExerciseProgress();
  };

  const isRefreshing = isRefetchingProfile || isRefetchingTestProgress || isRefetchingExerciseProgress;

  // Update editName when profile data loads
  React.useEffect(() => { setEditName((profile as any)?.fullname || ""); }, [profile]);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          }
        },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({ fullname: editName.trim() } as any);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const menuItems = [
    {
      id: "edit-profile",
      title: "Edit Profile",
      icon: Edit3,
      onPress: () => setIsEditing(true),
    },
    {
      id: "education",
      title: "Educational Resources",
      icon: BookOpen,
      onPress: () => router.push("/education"),
    },
    {
      id: "history",
      title: "Tests",
      icon: History,
      onPress: () => router.push("/tests"),
    },
    {
      id: "exercise",
      title: "Exercises",
      icon: Dumbbell,
      onPress: () => router.push("/exercises"),
    },
    {
      id: "scan-history",
      title: "Scan History",
      icon: Camera,
      onPress: () => router.push("/scans"),
    },
    {
      id: "logout",
      title: "Sign Out",
      icon: LogOut,
      onPress: handleSignOut,
      destructive: true,
    },
  ];

  const currentUser: any = profile || user;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#2E86AB" colors={["#2E86AB"]} />}>
        {/* Profile Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.avatarContainer}>
            <User color="#FFFFFF" size={32} />
          </View>
          <Text style={styles.userName}>{currentUser?.fullname || "User"}</Text>
          <Text style={styles.userEmail}>{currentUser?.email || "user@example.com"}</Text>
          {currentUser?.dateRegistered && (
            <Text style={styles.memberSince}>
              Member since {new Date(currentUser.dateRegistered).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{testProgress?.totalTests ?? '-'}</Text>
            <Text style={styles.statLabel}>Tests Taken</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{exerciseProgress?.totalSessions ?? '-'}</Text>
            <Text style={styles.statLabel}>Exercises Done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{exerciseProgress?.streak ?? '-'}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, item.destructive && styles.destructiveMenuItem]}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.menuIcon, item.destructive && styles.destructiveMenuIcon]}>
                <item.icon color={item.destructive ? "#F44336" : "#666666"} size={20} />
              </View>
              <Text style={[styles.menuTitle, item.destructive && styles.destructiveMenuTitle]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>EyeCare AI v1.0.0</Text>
          <Text style={styles.appDescription}>
            Your personal eye health companion
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal (SafeAreaView is correct here for modals) */}
      <Modal
        visible={isEditing}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleUpdateProfile} disabled={updateProfileMutation.isPending}>
              <Text style={[styles.modalSave, updateProfileMutation.isPending && styles.modalSaveDisabled]}>
                {updateProfileMutation.isPending ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your full name"
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={currentUser?.email || ""}
                editable={false}
                placeholder="Email cannot be changed"
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginBottom: 100,
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    paddingTop: 16, // Base padding, insets.top will be added dynamically
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2E86AB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
    color: "#999999",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E86AB",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  destructiveMenuItem: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  destructiveMenuIcon: {
    backgroundColor: "#FFEBEE",
  },
  menuTitle: {
    fontSize: 16,
    color: "#1A1A1A",
    flex: 1,
  },
  destructiveMenuTitle: {
    color: "#F44336",
  },
  appInfo: {
    padding: 24,
    alignItems: "center",
  },
  appVersion: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 12,
    color: "#999999",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  modalCancel: {
    fontSize: 16,
    color: "#666666",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  modalSave: {
    fontSize: 16,
    color: "#2E86AB",
    fontWeight: "600",
  },
  modalSaveDisabled: {
    color: "#999999",
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  disabledInput: {
    backgroundColor: "#F8F9FA",
    color: "#999999",
  },
});
