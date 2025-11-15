/**
 * ErrorBoundary Component
 *
 * Global error boundary that catches React errors and prevents white screen of death
 * Provides a user-friendly error message with option to reload
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { AlertTriangle } from '@repo/ui/components/icons';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console for development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // In production, you could send this to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full border-2 border-destructive/50">
            <div className="p-8 text-center space-y-6">
              {/* Error Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 border-2 border-destructive/20">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Something went wrong
                </h1>
                <p className="text-muted-foreground">
                  We encountered an unexpected error. Please try reloading the page or contact support if the problem persists.
                </p>
              </div>

              {/* Error Details (in development) */}
              {import.meta.env.DEV && this.state.error && (
                <Card className="bg-muted/30 border border-border p-4 text-left">
                  <details className="space-y-2">
                    <summary className="cursor-pointer font-semibold text-sm text-muted-foreground hover:text-foreground">
                      Error Details (Development Only)
                    </summary>
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-mono text-destructive break-all">
                        {this.state.error.toString()}
                      </p>
                      {this.state.errorInfo && (
                        <pre className="text-xs font-mono text-muted-foreground overflow-auto max-h-48 whitespace-pre-wrap break-words">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  </details>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={this.handleReset}
                  className="border-2"
                >
                  Try Again
                </Button>
                <Button onClick={this.handleReload} className="min-w-[140px]">
                  Reload Page
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
