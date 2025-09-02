import { useState, useEffect } from "react";
import { User } from "@/lib/types";
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  isAuthenticated,
  testSupabaseConnection,
} from "@/lib/auth/auth-utils";
import { supabase } from "@/lib/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log("🎣 useAuth hook initializing");

    // Test Supabase connection first
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Test connection
        const connectionTest = await testSupabaseConnection();
        if (!connectionTest.success) {
          console.error(
            "💥 Failed to connect to Supabase:",
            connectionTest.error,
          );
          setLoading(false);
          return;
        }

        console.log("✅ Supabase connection established");

        // Check if user is authenticated on mount
        const isUserAuthenticated = await isAuthenticated();
        if (isUserAuthenticated) {
          console.log(
            "🔍 User appears to be authenticated, getting current user",
          );
          const currentUser = await getCurrentUser();
          if (currentUser) {
            console.log("✅ Current user loaded:", currentUser.email);
            setUser(currentUser);
          } else {
            console.log("❌ No current user found despite authentication");
          }
        } else {
          console.log("ℹ️ No authenticated user found");
        }
      } catch (error) {
        console.error("💥 Auth initialization failed:", error);
      } finally {
        setLoading(false);
        setInitialized(true);
        console.log("✅ Auth hook initialized");
      }
    };

    initializeAuth();

    // Set up auth state change listener
    console.log("🎧 Setting up auth state listener");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔄 Auth state changed: ${event}`, {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
      });

      setLoading(true);

      try {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          console.log("✅ User signed in or token refreshed");
          const currentUser = await getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            console.log("✅ User state updated:", currentUser.email);
          } else {
            console.error("❌ Failed to get current user after sign in");
          }
        } else if (event === "SIGNED_OUT") {
          console.log("👋 User signed out");
          setUser(null);
        } else if (event === "USER_UPDATED") {
          console.log("📝 User updated");
          const currentUser = await getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error("💥 Error handling auth state change:", error);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log("🧹 Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log("🚀 Login attempt for:", email);

    try {
      setLoading(true);
      const result = await loginUser({ email, password });

      console.log("📊 Login result:", {
        success: result.success,
        hasUser: !!result.user,
      });

      if (result.success && result.user) {
        setUser(result.user);
        console.log("✅ Login successful, user state updated");
        return { success: true };
      } else {
        console.error("❌ Login failed:", result.error);
        return { success: false, error: result.error || "Login failed" };
      }
    } catch (error) {
      console.error("💥 Login error:", error);
      return {
        success: false,
        error: "An unexpected error occurred during login",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    console.log("📝 Registration attempt for:", email);

    try {
      setLoading(true);
      const result = await registerUser({ email, password, name });

      console.log("📊 Registration result:", {
        success: result.success,
        hasUser: !!result.user,
      });

      if (result.success && result.user) {
        setUser(result.user);
        console.log("✅ Registration successful, user state updated");
        return {
          success: true,
          needsConfirmation: (result as any).needsConfirmation || false,
        };
      } else {
        console.error("❌ Registration failed:", result.error);
        return { success: false, error: result.error || "Registration failed" };
      }
    } catch (error) {
      console.error("💥 Registration error:", error);
      return {
        success: false,
        error: "An unexpected error occurred during registration",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log("👋 Logout attempt");

    try {
      setLoading(true);
      const result = await logoutUser();

      if (result.success) {
        setUser(null);
        console.log("✅ Logout successful, user state cleared");
        return { success: true };
      } else {
        console.error("❌ Logout failed:", result.error);
        return { success: false, error: result.error || "Logout failed" };
      }
    } catch (error) {
      console.error("💥 Logout error:", error);
      return {
        success: false,
        error: "An unexpected error occurred during logout",
      };
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    console.log("🔄 Refreshing user data");

    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        console.log("✅ User data refreshed");
        return currentUser;
      } else {
        console.log("ℹ️ No user to refresh");
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error("💥 Error refreshing user:", error);
      return null;
    }
  };

  // Debug information
  const debugInfo = {
    loading,
    initialized,
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    isAuthenticated: !!user,
  };

  console.log("📊 useAuth current state:", debugInfo);

  return {
    user,
    loading,
    initialized,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    debugInfo,
  };
}
