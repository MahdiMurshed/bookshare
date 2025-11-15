import { useAuth } from "../contexts/AuthContext";
import { useBooks } from "../hooks/useBooks";
import { useIncomingBorrowRequests } from "../hooks/useBorrowRequests";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Sparkles,
  ArrowRight,
  Library,
  Heart,
  TrendingUp,
  BookMarked,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const { data: userBooks } = useBooks(user?.id);
  const { data: incomingRequests } = useIncomingBorrowRequests();

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const userStats = user
    ? {
        booksOwned: userBooks?.length || 0,
        booksShared: userBooks?.filter((b) => b.borrowable).length || 0,
        activeRequests:
          incomingRequests?.filter((r) => r.status === "pending").length || 0,
      }
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 40px),
                               repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 40px)`,
            }}
          />
        </div>

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 sm:py-24 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Column - Content */}
              <div
                className={`space-y-8 transition-all duration-1000 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                {user && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border">
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Welcome back,{" "}
                      {user.user_metadata?.name || user.email?.split("@")[0]}
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                    Share Books,{" "}
                    <span className="relative inline-block">
                      <span className="relative z-10">Build Community</span>
                      <span className="absolute bottom-2 left-0 w-full h-3 bg-primary/20 -rotate-1" />
                    </span>
                  </h1>

                  <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
                    Connect with fellow readers, discover new perspectives, and
                    give your books a second life. BookShare makes sharing as
                    simple as turning a page.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="group font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link to="/browse">
                      Browse Books
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>

                  {user && (
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="font-semibold"
                    >
                      <Link to="/my-library">
                        <Library className="mr-2 w-4 h-4" />
                        My Library
                      </Link>
                    </Button>
                  )}

                  {!user && (
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="font-semibold"
                    >
                      <Link to="/signin">Sign In</Link>
                    </Button>
                  )}
                </div>

                {/* User Stats (if authenticated) */}
                {user && userStats && (
                  <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-foreground">
                        {userStats.booksOwned}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Books Owned
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-foreground">
                        {userStats.booksShared}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Shareable
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-foreground">
                        {userStats.activeRequests}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pending
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Floating Book Cards */}
              <div className="relative hidden lg:block h-[500px]">
                <FloatingBookCard
                  delay="0s"
                  className="absolute top-0 right-12 w-48"
                  title="The Great Gatsby"
                  author="F. Scott Fitzgerald"
                  color="bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40"
                />
                <FloatingBookCard
                  delay="0.3s"
                  className="absolute top-32 right-0 w-52"
                  title="1984"
                  author="George Orwell"
                  color="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/40 dark:to-slate-700/40"
                />
                <FloatingBookCard
                  delay="0.6s"
                  className="absolute top-64 right-16 w-44"
                  title="To Kill a Mockingbird"
                  author="Harper Lee"
                  color="bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/40 dark:to-rose-800/40"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-16 transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Why BookShare
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Reading Made Social
            </h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your personal library into a community resource.
              Sustainable, social, and simple.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={BookOpen}
              title="Discover & Borrow"
              description="Browse books from your community. Request to borrow with one click and coordinate pickup easily."
              delay="0.1s"
              isVisible={isVisible}
            />
            <FeatureCard
              icon={Users}
              title="Build Connections"
              description="Meet fellow readers nearby. Share recommendations, discuss favorites, and grow your reading circle."
              delay="0.2s"
              isVisible={isVisible}
            />
            <FeatureCard
              icon={Library}
              title="Manage Your Library"
              description="Organize your collection, track lending history, and decide what to share with the community."
              delay="0.3s"
              isVisible={isVisible}
            />
            <FeatureCard
              icon={Heart}
              title="Sustainable Reading"
              description="Give books a second life. Reduce waste and environmental impact while spreading knowledge."
              delay="0.4s"
              isVisible={isVisible}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Track Your Impact"
              description="See how many books you've shared, borrowed, and the connections you've made along the way."
              delay="0.5s"
              isVisible={isVisible}
            />
            <FeatureCard
              icon={BookMarked}
              title="Reviews & Ratings"
              description="Leave reviews, rate books, and help others discover their next great read with your insights."
              delay="0.6s"
              isVisible={isVisible}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 border-t border-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden border-2">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />

            <div className="relative p-8 sm:p-12 lg:p-16">
              <div className="max-w-3xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                    Ready to Start Sharing?
                  </h2>
                  <p className="text-lg sm:text-xl text-muted-foreground">
                    Join our community of readers. Your next favorite book is
                    just a borrow away.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!user ? (
                    <>
                      <Button asChild size="lg" className="font-semibold">
                        <Link to="/signup">Create Account</Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="font-semibold"
                      >
                        <Link to="/browse">Browse Books First</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild size="lg" className="font-semibold">
                        <Link to="/my-library">Add Your First Book</Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="font-semibold"
                      >
                        <Link to="/browse">Explore Community</Link>
                      </Button>
                    </>
                  )}
                </div>

                <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground border-t border-border">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Free Forever</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Local Community</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span>Eco-Friendly</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

// Floating Book Card Component
function FloatingBookCard({
  delay,
  className,
  title,
  author,
  color,
}: {
  delay: string;
  className: string;
  title: string;
  author: string;
  color: string;
}) {
  return (
    <div
      className={`${className} animate-float`}
      style={{ animationDelay: delay }}
    >
      <Card
        className={`${color} border-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer`}
      >
        <div className="p-6 space-y-3">
          <div className="w-12 h-1 bg-foreground/20 rounded-full" />
          <div className="space-y-1.5">
            <h3 className="font-bold text-lg leading-tight line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{author}</p>
          </div>
          <div className="pt-4 flex gap-1">
            <div className="w-8 h-1 bg-foreground/10 rounded-full" />
            <div className="w-12 h-1 bg-foreground/10 rounded-full" />
            <div className="w-6 h-1 bg-foreground/10 rounded-full" />
          </div>
        </div>
      </Card>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
  isVisible,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: string;
  isVisible: boolean;
}) {
  return (
    <Card
      className={`group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-lg ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: delay }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-6 sm:p-8 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-primary" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  );
}
