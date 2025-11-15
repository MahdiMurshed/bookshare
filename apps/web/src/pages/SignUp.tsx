import { Link, useNavigate } from "react-router-dom";
import { SignUpForm } from "../components/auth/SignUpForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

export function SignUp() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSuccess = () => {
    // Navigate to sign in after successful sign up
    // (User needs to verify email or can auto-sign in depending on your flow)
    navigate("/signin");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 bg-background">
      {/* Subtle Background Pattern */}
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
        className={`relative w-full max-w-md transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* BookShare Branding */}
        <div className="text-center mb-8 space-y-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-3 mb-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <h1 className="font-serif text-4xl font-bold">
              BookShare
            </h1>
          </Link>
          <p className="text-base text-muted-foreground font-medium">
            Join our reading community
          </p>
        </div>

        {/* Sign Up Card */}
        <Card className="border-2 shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90 transition-all duration-500">
          <CardHeader className="space-y-2 pb-6 pt-8">
            <CardTitle className="text-3xl font-bold text-center tracking-tight">
              Create Account
            </CardTitle>
            <CardDescription className="text-center text-base">
              Start sharing and discovering books
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-8">
            <SignUpForm onSuccess={handleSuccess} />
          </CardContent>
        </Card>

        {/* Sign In Link */}
        <div className="mt-6">
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground font-medium">
                Already a member?
              </span>
            </div>
          </div>

          <Link
            to="/signin"
            className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-border hover:bg-muted transition-all duration-200"
          >
            <span className="font-semibold text-foreground">
              Sign in to your account
            </span>
          </Link>
        </div>

        {/* Terms */}
        <p className="mt-8 text-xs text-center text-muted-foreground leading-relaxed max-w-sm mx-auto">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
