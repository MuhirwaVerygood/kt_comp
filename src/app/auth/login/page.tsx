"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
// @ts-ignore
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[id as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to login");
      }

      // Store token in localStorage
      if (data.data.token) {
        localStorage.setItem("auth_token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }

      // Check user role for redirection
      const userRole = data.data.user.role;

      if (userRole === "ADMIN") {
        // Redirect admin to dashboard
        router.push("/dashboard");
      } else {
        // For clients, redirect to home page
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-4">
          <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-col items-center space-y-1.5 pb-4 pt-6">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <img src="/logo.png" alt="logo" className="size-8" />
                <span className="text-blue-700 font-bold">KT</span>
                ComputerSupply
              </h2>
              <div className="space-y-1 flex flex-col items-center">
                <h2 className="text-lg font-semibold text-foreground">
                  Welcome back
                </h2>
                <p className="text-muted-foreground">
                  Sign in to your account to continue
                </p>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 px-8">
                {/* Success Message */}
                {success && (
                  <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-600">
                      Login successful! Redirecting...
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={formErrors.email ? "border-red-500" : ""}
                    placeholder="you@example.com"
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-500">{formErrors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password *</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={
                        formErrors.password ? "border-red-500 pr-10" : "pr-10"
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {formErrors.password && (
                    <p className="text-xs text-red-500">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked: boolean) =>
                      setRememberMe(checked)
                    }
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground"
                  >
                    Remember me
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground"
                  disabled={isLoading || success}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </CardContent>
            </form>
            <CardFooter className="flex justify-center border-t py-4">
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-primary hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
