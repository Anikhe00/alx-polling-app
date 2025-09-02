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

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();
  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    console.log("📝 Registration form submitted for:", data.email);
    setError(null);
    setSuccess(null);

    if (data.password !== data.confirmPassword) {
      console.error("❌ Password mismatch");
      setError("Passwords do not match");
      return;
    }

    try {
      console.log("📞 Calling register function...");
      const result = await registerUser(data.email, data.password, data.name);
      console.log("📊 Register function returned:", result);

      if (result.success) {
        console.log("✅ Registration successful, redirecting...");
        setSuccess("Account created successfully! Redirecting to dashboard...");
        // Get redirect URL from query params or default to dashboard
        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get("redirect") || "/dashboard";
        console.log("🔄 Redirecting to:", redirectUrl);
        setTimeout(() => router.push(redirectUrl), 1000); // Small delay to show success message
      } else {
        console.error("❌ Registration failed:", result.error);
        setError(result.error || "Registration failed");
      }
    } catch (error) {
      console.error("💥 Registration error:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm">
            <strong>Error:</strong> {error}
            <div className="text-xs mt-1 text-red-500">
              Check the browser console for more details.
            </div>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded text-sm">
            <strong>Success:</strong> {success}
          </div>
        )}
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register("name", {
                required: "Name is required",
              })}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
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
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
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
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
