import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService, User } from "../services/api";

export type AuthUser = User;

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_USER_KEY = "auth_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if we have a token first
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          // Try to get user profile from API
          try {
            const userProfile = await authService.getProfile();
            setUser(userProfile);
            await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userProfile));
          } catch (error) {
            // Token might be invalid, clear it
            console.error('Failed to load user profile:', error);
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('refresh_token');
          }
        } else {
          // Fallback to stored user data
          const stored = await AsyncStorage.getItem(AUTH_USER_KEY);
          if (stored) {
            setUser(JSON.parse(stored));
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const persistUser = useCallback(async (nextUser: AuthUser | null) => {
    if (nextUser) {
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
    } else {
      await AsyncStorage.removeItem(AUTH_USER_KEY);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      setUser(response.user);
      await persistUser(response.user);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [persistUser]);

  const signUp = useCallback(async (email: string, password: string, fullname?: string, phone?: string) => {
    try {
      setIsLoading(true);
      const response = await authService.register({ email, password, fullname, phone });
      setUser(response.user);
      await persistUser(response.user);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [persistUser]);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.log(error)
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      await persistUser(null);
    }
  }, [persistUser]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      await persistUser(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }, [persistUser]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }), [user, isLoading, signIn, signUp, signOut, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
