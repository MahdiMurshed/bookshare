import { Link, useNavigate } from "react-router-dom";
import { SignInForm } from "../components/auth/SignInForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { BookOpen, Sparkles } from "lucide-react";
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Warm Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-rose-950/20" />

      {/* Animated Background Pattern - Book Spines */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 50px,
            currentColor 50px,
            currentColor 52px,
            transparent 52px,
            transparent 80px,
            currentColor 80px,
            currentColor 83px
          )`
        }} />
      </div>

      {/* Decorative Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Right Book Stack */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-amber-200/40 to-orange-300/40 dark:from-amber-800/20 dark:to-orange-900/20 rounded-full blur-3xl" />

        {/* Bottom Left Glow */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-rose-200/40 to-amber-200/40 dark:from-rose-900/20 dark:to-amber-900/20 rounded-full blur-3xl" />

        {/* Floating Book Icons */}
        <BookOpen className="absolute top-20 right-[15%] w-16 h-16 text-amber-300/20 dark:text-amber-600/10 rotate-12 animate-float" style={{ animationDelay: "0s" }} />
        <BookOpen className="absolute bottom-32 left-[10%] w-12 h-12 text-orange-300/20 dark:text-orange-600/10 -rotate-12 animate-float" style={{ animationDelay: "0.5s" }} />
        <Sparkles className="absolute top-40 left-[20%] w-8 h-8 text-amber-400/30 dark:text-amber-500/20 animate-float" style={{ animationDelay: "0.3s" }} />
      </div>

      {/* Main Content */}
      <div className={`relative w-full max-w-md transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}>
        {/* BookShare Branding */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-lg opacity-40" />
              <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-2xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="font-serif text-4xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 dark:from-amber-400 dark:via-orange-300 dark:to-amber-400 bg-clip-text text-transparent">
              BookShare
            </h1>
          </div>
          <p className="text-base text-muted-foreground font-medium">
            Welcome back to your reading community
          </p>
        </div>

        {/* Sign In Card */}
        <Card className="border-2 shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90 hover:shadow-amber-200/20 dark:hover:shadow-amber-900/30 transition-all duration-500">
          {/* Subtle Top Border Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />

          <CardHeader className="space-y-2 pb-6 pt-8">
            <CardTitle className="text-3xl font-bold text-center font-serif tracking-tight">
              Sign In
            </CardTitle>
            <CardDescription className="text-center text-base">
              Continue your literary journey
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-6">
            <SignInForm onSuccess={handleSuccess} />
          </CardContent>

          <CardFooter className="flex flex-col space-y-6 pb-8 pt-2">
            {/* Divider */}
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-medium">
                  New to BookShare?
                </span>
              </div>
            </div>

            {/* Sign Up CTA */}
            <Link
              to="/signup"
              className="group relative w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/50 dark:hover:to-orange-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-200/50 dark:hover:shadow-amber-900/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="font-semibold text-amber-900 dark:text-amber-100">
                Create an account
              </span>
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
            </Link>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Community-Driven</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Footer Quote */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground italic font-serif">
            "A book shared is a story multiplied"
          </p>
        </div>
      </div>
    </div>
  );
}
