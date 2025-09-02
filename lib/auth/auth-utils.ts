import { AuthFormData } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";

export async function loginUser(data: AuthFormData) {
  console.log("🔐 Starting login process for:", data.email);

  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    console.log("📊 Auth response:", { authData, error });

    if (error) {
      console.error("❌ Login error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    if (!authData.user) {
      console.error("❌ No user data returned");
      return {
        success: false,
        error: "Login failed - no user data",
      };
    }

    console.log("✅ Login successful for user:", authData.user.id);

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email || "",
        name:
          authData.user.user_metadata?.name ||
          authData.user.user_metadata?.full_name ||
          authData.user.email?.split("@")[0] ||
          "",
        avatar: authData.user.user_metadata?.avatar_url || "",
        createdAt: new Date(authData.user.created_at || ""),
        updatedAt: new Date(),
      },
    };
  } catch (error) {
    console.error("💥 Unexpected login error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during login",
    };
  }
}

export async function registerUser(data: AuthFormData) {
  console.log("📝 Starting registration process for:", data.email);

  try {
    // Register the user with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name || "",
          full_name: data.name || "",
        },
      },
    });

    console.log("📊 Registration response:", { authData, error: signUpError });

    if (signUpError) {
      console.error("❌ Registration error:", signUpError.message);
      return {
        success: false,
        error: signUpError.message,
      };
    }

    if (!authData.user) {
      console.error("❌ User registration failed - no user data");
      return {
        success: false,
        error: "User registration failed",
      };
    }

    console.log("✅ Registration successful for user:", authData.user.id);

    // Check if email confirmation is required
    if (authData.session) {
      console.log("🎯 User auto-confirmed and signed in");
    } else {
      console.log("📧 Email confirmation required");
      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email || "",
          name: data.name || authData.user.email?.split("@")[0] || "",
          avatar: "",
          createdAt: new Date(authData.user.created_at || ""),
          updatedAt: new Date(),
        },
        needsConfirmation: true,
      };
    }

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email || "",
        name: data.name || authData.user.email?.split("@")[0] || "",
        avatar: "",
        createdAt: new Date(authData.user.created_at || ""),
        updatedAt: new Date(),
      },
    };
  } catch (error) {
    console.error("💥 Unexpected registration error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during registration",
    };
  }
}

export async function logoutUser() {
  console.log("👋 Starting logout process");

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("❌ Logout error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("✅ Logout successful");
    return {
      success: true,
    };
  } catch (error) {
    console.error("💥 Unexpected logout error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during logout",
    };
  }
}

export async function getCurrentUser() {
  console.log("👤 Getting current user");

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    console.log("📊 Session status:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      error: sessionError,
    });

    if (sessionError) {
      console.error("❌ Session error:", sessionError);
      return null;
    }

    if (!session?.user) {
      console.log("ℹ️ No active session");
      return null;
    }

    const user = session.user;
    console.log("✅ Current user found:", user.id);

    return {
      id: user.id,
      email: user.email || "",
      name:
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "",
      avatar: user.user_metadata?.avatar_url || "",
      createdAt: new Date(user.created_at || ""),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("💥 Unexpected error getting current user:", error);
    return null;
  }
}

export async function isAuthenticated() {
  console.log("🔍 Checking authentication status");

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("❌ Authentication check error:", error);
      return false;
    }

    const authenticated = !!session?.user;
    console.log(`🎯 Authentication status: ${authenticated}`);

    return authenticated;
  } catch (error) {
    console.error("💥 Authentication check error:", error);
    return false;
  }
}

// Debug function to test Supabase connection
export async function testSupabaseConnection() {
  console.log("🔧 Testing Supabase connection");

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("❌ Supabase connection error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("✅ Supabase connection successful");
    return {
      success: true,
      hasSession: !!data.session,
    };
  } catch (error) {
    console.error("💥 Supabase connection test failed:", error);
    return {
      success: false,
      error: "Failed to connect to Supabase",
    };
  }
}
