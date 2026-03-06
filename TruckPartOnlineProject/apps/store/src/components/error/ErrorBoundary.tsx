import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback UI. Receives the caught error. */
  fallback?: (error: Error) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Class-based Error Boundary that catches rendering errors in its subtree.
 * Displays a dark-themed fallback UI consistent with the rest of the app.
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError || error === null) {
      return children;
    }

    if (fallback) {
      return fallback(error);
    }

    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full">
          {/* Red accent bar */}
          <div className="w-16 h-1 bg-red-600 mx-auto mb-8" />

          <h1 className="text-3xl font-black text-white mb-3 tracking-tight">
            Algo salió mal
          </h1>

          <p className="text-zinc-400 mb-4 text-sm">
            Ocurrió un error inesperado en la aplicación.
          </p>

          {/* Error detail — collapsed in production */}
          {import.meta.env.DEV && (
            <pre className="text-left text-xs text-red-400 bg-zinc-900 border border-zinc-800 rounded p-4 mb-6 overflow-auto max-h-40">
              {error.message}
            </pre>
          )}

          <button
            type="button"
            onClick={this.handleReload}
            className="inline-block border border-red-600 text-red-600 px-8 py-3 hover:bg-red-600 hover:text-white transition-colors font-bold tracking-widest uppercase text-sm"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }
}
