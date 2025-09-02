"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    console.log("🚀 Login form submitted for:", data.email);
    setError(null);

    try {
      console.log("📞 Calling login function...");
      const result = await login(data.email, data.password);
      console.log("📊 Login function returned:", result);

      if (result.success) {
        console.log("✅ Login successful, redirecting...");
        // Get redirect URL from query params or default to dashboard
        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get("redirect") || "/dashboard";
        console.log("🔄 Redirecting to:", redirectUrl);
        router.push(redirectUrl);
      } else {
        console.error("❌ Login failed:", result.error);
        setError(result.error || "Login failed");
      }
    } catch (error) {
      console.error("💥 Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm">
            <strong>Error:</strong> {error}
            <div className="text-xs mt-1 text-red-500">
              Check the browser console for more details.
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/test-auth")}
              className="text-xs text-blue-600 hover:underline"
            >
              Debug Auth Issues
            </button>
          </div>
        </form>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
