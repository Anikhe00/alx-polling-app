"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { testSupabaseConnection } from "@/lib/auth/auth-utils";

export default function TestAuthPage() {
  const auth = useAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("Test User");

  const handleSupabaseTest = async () => {
    console.log("🔧 Testing Supabase connection...");
    const result = await testSupabaseConnection();
    setTestResults(result);
  };

  const handleTestLogin = async () => {
    console.log("🔐 Testing login...");
    const result = await auth.login(email, password);
    console.log("Login result:", result);
  };

  const handleTestRegister = async () => {
    console.log("📝 Testing registration...");
    const result = await auth.register(email, password, name);
    console.log("Registration result:", result);
  };

  const handleRefreshUser = async () => {
    console.log("🔄 Refreshing user...");
    const result = await auth.refreshUser();
    console.log("Refresh result:", result);
  };

  const handleLogout = async () => {
    console.log("👋 Testing logout...");
    const result = await auth.logout();
    console.log("Logout result:", result);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">Auth Debug Page</h1>

        {/* Auth Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Auth Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span>Loading:</span>
                <span className={auth.loading ? "text-yellow-600" : "text-green-600"}>
                  {auth.loading ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Initialized:</span>
                <span className={auth.initialized ? "text-green-600" : "text-yellow-600"}>
                  {auth.initialized ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Authenticated:</span>
                <span className={auth.isAuthenticated ? "text-green-600" : "text-red-600"}>
                  {auth.isAuthenticated ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>User ID:</span>
                <span className="font-mono text-xs">
                  {auth.user?.id || "None"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span>{auth.user?.email || "None"}</span>
              </div>
              <div className="flex justify-between">
                <span>Name:</span>
                <span>{auth.user?.name || "None"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Connection */}
        <Card>
          <CardHeader>
            <CardTitle>Supabase Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSupabaseTest} variant="outline">
              Test Supabase Connection
            </Button>
            {testResults && (
              <div className="p-4 bg-gray-100 rounded">
                <pre>{JSON.stringify(testResults, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Credentials */}
        <Card>
          <CardHeader>
            <CardTitle>Test Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-name">Name</Label>
              <Input
                id="test-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="test-email">Email</Label>
              <Input
                id="test-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="test-password">Password</Label>
              <Input
                id="test-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Authentication Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={handleTestRegister}
                disabled={auth.loading}
                variant="default"
              >
                Test Register
              </Button>
              <Button
                onClick={handleTestLogin}
                disabled={auth.loading}
                variant="default"
              >
                Test Login
              </Button>
              <Button
                onClick={handleRefreshUser}
                disabled={auth.loading}
                variant="outline"
              >
                Refresh User
              </Button>
              <Button
                onClick={handleLogout}
                disabled={auth.loading}
                variant="destructive"
              >
                Test Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-auto">
              <pre>{JSON.stringify(auth.debugInfo, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>

        {/* Environment Check */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Supabase URL:</span>
                <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? "text-green-600" : "text-red-600"}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Supabase Anon Key:</span>
                <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "text-green-600" : "text-red-600"}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <ol className="list-decimal list-inside space-y-2">
              <li>First, check that environment variables are set correctly</li>
              <li>Test Supabase connection to ensure it&apos;s working</li>
              <li>Try registering a new user with test credentials</li>
              <li>Try logging in with the same credentials</li>
              <li>Check the browser console for detailed logs</li>
              <li>Open browser DevTools &gt; Console to see all debug messages</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
