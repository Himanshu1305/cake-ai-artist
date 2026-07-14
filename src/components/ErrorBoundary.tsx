import React, { Component, ErrorInfo, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  children: ReactNode;
  component?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const RELOAD_KEY = "lazy-retry-reloaded";

const isChunkLoadError = (error: Error | null): boolean => {
  if (!error) return false;
  const msg = error.message || "";
  return /loading (dynamically imported module|chunk)|Failed to fetch dynamically imported module|ChunkLoadError|Importing a module script failed/i.test(
    msg
  );
};

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Stale chunk after deploy — recover silently with a one-shot reload.
    if (isChunkLoadError(error)) {
      try {
        const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY);
        if (!alreadyReloaded) {
          sessionStorage.setItem(RELOAD_KEY, "1");
          window.location.reload();
          return;
        }
      } catch {
        /* fall through to normal error UI */
      }
    }
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });

    supabase.from("client_errors").insert({
      component: this.props.component ?? null,
      error_name: error.name,
      error_message: error.message?.slice(0, 500),
      stack: error.stack?.slice(0, 2000),
      component_stack: errorInfo.componentStack?.slice(0, 2000),
      user_agent: navigator.userAgent?.slice(0, 300),
    }).then();
  }

  public render() {
    if (this.state.hasError) {
      return (

        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-lg w-full bg-card border border-destructive/20 rounded-lg p-6 shadow-lg">
            <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">
              An error occurred while rendering the application.
            </p>
            <details className="bg-muted p-4 rounded text-sm overflow-auto max-h-64">
              <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
              <pre className="whitespace-pre-wrap text-destructive">
                {this.state.error?.toString()}
              </pre>
              <pre className="whitespace-pre-wrap text-muted-foreground mt-2">
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
