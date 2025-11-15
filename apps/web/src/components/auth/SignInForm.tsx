import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "@repo/api-client";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

// Zod validation schema
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
  onSuccess?: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignInFormData) {
    setIsLoading(true);
    setError(null);

    try {
      await signIn({
        email: data.email,
        password: data.password,
      });

      // Call success callback
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Error Alert */}
        {error && (
          <div className="group relative overflow-hidden rounded-lg border-2 border-red-200 dark:border-red-900/50 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/40 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="rounded-full bg-red-100 dark:bg-red-900/40 p-1">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold text-foreground">
                Email Address
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className="w-4 h-4 text-muted-foreground group-focus-within:text-amber-600 dark:group-focus-within:text-amber-400 transition-colors duration-200" />
                  </div>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    disabled={isLoading}
                    className="pl-10 h-11 border-2 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 dark:focus-visible:border-amber-400 transition-all duration-200 bg-background/50"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold text-foreground">
                Password
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className="w-4 h-4 text-muted-foreground group-focus-within:text-amber-600 dark:group-focus-within:text-amber-400 transition-colors duration-200" />
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="pl-10 h-11 border-2 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 dark:focus-visible:border-amber-400 transition-all duration-200 bg-background/50"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="relative w-full h-11 mt-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 dark:from-amber-500 dark:to-orange-500 dark:hover:from-amber-600 dark:hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/30 dark:shadow-amber-900/30 hover:shadow-xl hover:shadow-amber-500/40 dark:hover:shadow-amber-900/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </span>
          ) : (
            <span>Sign In</span>
          )}
        </Button>
      </form>
    </Form>
  );
}
