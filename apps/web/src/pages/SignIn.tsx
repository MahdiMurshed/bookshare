import { Link, useNavigate } from "react-router-dom";
import { SignInForm } from "../components/auth/SignInForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { BookOpen, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export function SignIn() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSuccess = () => {
    // Navigate to dashboard after successful sign in
    navigate("/");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12 bg-background">
      {/* Subtle Grid Background Pattern - matching Home page */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 40px),
                             repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 40px)`,
          }}
        />
      </div>

      {/* Main Content */}
      <div
        className={`relative w-full max-w-md transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* BookShare Branding */}
        <div className="text-center mb-8 space-y-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-3 mb-1 group"
          >
            <div className="p-2 rounded-lg bg-foreground/5 border border-border group-hover:bg-foreground/10 transition-colors">
              <BookOpen className="w-6 h-6 text-foreground" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              BookShare
            </h1>
          </Link>
          <p className="text-sm text-muted-foreground">
            Welcome back to your reading community
          </p>
        </div>

        {/* Sign In Card */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Sign in to your account
            </CardTitle>
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <SignInForm onSuccess={handleSuccess} />

            {/* Sign Up Link */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-primary hover:underline inline-flex items-center gap-1 group"
                >
                  Create account
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Secure authentication powered by Supabase</p>
        </div>
      </div>
    </div>
  );
}
