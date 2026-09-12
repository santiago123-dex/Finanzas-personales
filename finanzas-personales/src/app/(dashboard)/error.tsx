"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="w-full max-w-md space-y-4">
        <div className="text-5xl">⚠️</div>
        <div>
          <h1 className="text-xl font-bold">Algo salió mal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ocurrió un error al cargar esta sección.
          </p>
        </div>

        <pre className="rounded-lg border border-border bg-muted/50 p-4 text-left text-xs leading-relaxed text-foreground break-words">
          {error.message || "Error sin mensaje"}
        </pre>

        <button
          onClick={reset}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
