import { Link, useNavigate } from "react-router-dom";
import { SignUpForm } from "../components/auth/SignUpForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { BookOpen, Users, Sparkles, Library } from "lucide-react";
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
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50/50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-rose-950/20">
      {/* Background Pattern - Subtle Book Grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 60px),
                             repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 45px)`,
          }}
        />
      </div>

      {/* Decorative Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Right Glow */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-amber-300/30 to-orange-400/30 dark:from-amber-800/15 dark:to-orange-900/15 rounded-full blur-3xl" />

        {/* Bottom Left Glow */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-rose-300/30 to-amber-300/30 dark:from-rose-900/15 dark:to-amber-900/15 rounded-full blur-3xl" />

        {/* Floating Book Icons */}
        <BookOpen className="absolute top-24 right-[12%] w-20 h-20 text-amber-400/15 dark:text-amber-600/10 rotate-12 animate-float" style={{ animationDelay: "0s" }} />
        <Sparkles className="absolute top-1/3 left-[8%] w-12 h-12 text-orange-400/20 dark:text-orange-500/15 animate-float" style={{ animationDelay: "0.4s" }} />
        <Users className="absolute bottom-1/4 right-[18%] w-16 h-16 text-rose-400/15 dark:text-rose-600/10 -rotate-12 animate-float" style={{ animationDelay: "0.7s" }} />
      </div>

      {/* Left Panel - Branding & Welcome (Hidden on mobile) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 bg-white/40 dark:bg-black/20 backdrop-blur-sm border-r border-amber-200/50 dark:border-amber-800/30">
        <div
          className={`space-y-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
          }`}
        >
          {/* Logo */}
          <Link
            to="/"
            className="inline-flex items-center gap-3 group transition-transform hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl blur-md opacity-50" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="text-2xl font-serif font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 dark:from-amber-400 dark:via-orange-300 dark:to-amber-400 bg-clip-text text-transparent tracking-tight">
              BookShare
            </span>
          </Link>

          {/* Main Content */}
          <div className="space-y-8 max-w-md">
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-serif font-bold leading-[1.1] tracking-tight">
                Join a Community of{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">Readers</span>
                  <span className="absolute bottom-2 left-0 w-full h-3 bg-foreground/10 -rotate-1" />
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Share your books, discover new stories, and connect with fellow
                book lovers in your community.
              </p>
            </div>

            {/* Literary Quote */}
            <div className="relative pl-6 border-l-2 border-foreground/20">
              <p className="text-base italic text-muted-foreground font-serif leading-relaxed">
                "A book is a gift you can open again and again."
              </p>
              <p className="text-sm text-muted-foreground/60 mt-2">
                — Garrison Keillor
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4 pt-4">
              <FeatureItem
                icon={Library}
                text="Build your digital library"
                delay="0.2s"
              />
              <FeatureItem
                icon={Users}
                text="Connect with local readers"
                delay="0.3s"
              />
              <FeatureItem
                icon={Sparkles}
                text="Discover your next favorite book"
                delay="0.4s"
              />
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div
          className={`flex gap-12 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="space-y-1">
            <div className="text-3xl font-bold font-serif">10K+</div>
            <div className="text-sm text-muted-foreground">Books Shared</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold font-serif">5K+</div>
            <div className="text-sm text-muted-foreground">Active Readers</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold font-serif">98%</div>
            <div className="text-sm text-muted-foreground">Satisfaction</div>
          </div>
        </div>

        {/* Decorative Book Spine Elements */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 space-y-2 opacity-20">
          <div className="w-1 h-24 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full shadow-sm" />
          <div className="w-1 h-32 bg-gradient-to-b from-orange-500 to-rose-500 rounded-full shadow-sm" />
          <div className="w-1 h-20 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full shadow-sm" />
          <div className="w-1 h-28 bg-gradient-to-b from-rose-400 to-rose-600 rounded-full shadow-sm" />
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
      <div className="relative flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div
          className={`w-full max-w-md transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Mobile Logo */}
          <Link
            to="/"
            className="inline-flex lg:hidden items-center gap-3 mb-8 group transition-transform hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl blur-md opacity-50" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="text-2xl font-serif font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 dark:from-amber-400 dark:via-orange-300 dark:to-amber-400 bg-clip-text text-transparent tracking-tight">
              BookShare
            </span>
          </Link>

          <Card className="relative border-2 border-amber-200/50 dark:border-amber-800/50 shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90 hover:shadow-amber-200/30 dark:hover:shadow-amber-900/40 transition-all duration-500">
            {/* Subtle Top Border Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />
            <CardHeader className="space-y-3 pb-6 pt-8">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-serif font-bold tracking-tight text-center">
                  Create Account
                </CardTitle>
                <CardDescription className="text-base text-center">
                  Start your journey in the BookShare community
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pb-8">
              <SignUpForm onSuccess={handleSuccess} />
            </CardContent>
          </Card>

          {/* Sign In Link */}
          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-amber-200/50 dark:border-amber-800/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-rose-950/20 px-3 text-muted-foreground font-medium">
                  Already a member?
                </span>
              </div>
            </div>

            <Link
              to="/signin"
              className="group relative w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/50 dark:hover:to-orange-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-200/50 dark:hover:shadow-amber-900/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="font-semibold text-amber-900 dark:text-amber-100">
                Sign in to your account
              </span>
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300" />
            </Link>
          </div>

          {/* Terms */}
          <p className="mt-8 text-xs text-center text-muted-foreground leading-relaxed max-w-sm mx-auto">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-amber-700 dark:text-amber-400 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-amber-700 dark:text-amber-400 hover:underline">
              Privacy Policy
            </a>
            . We respect your privacy and will never share your personal
            information.
          </p>
        </div>
      </div>
    </div>
  );
}

// Feature Item Component
function FeatureItem({
  icon: Icon,
  text,
  delay,
}: {
  icon: React.ElementType;
  text: string;
  delay: string;
}) {
  return (
    <div
      className="flex items-center gap-3 transition-all duration-700 opacity-0 animate-fade-in"
      style={{ animationDelay: delay, animationFillMode: "forwards" }}
    >
      <div className="w-8 h-8 rounded-lg bg-foreground/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-foreground" />
      </div>
      <span className="text-sm font-medium text-foreground">{text}</span>
    </div>
  );
}
