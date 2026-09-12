"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error global:", error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          display: "flex",
          minHeight: "100dvh",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "2rem",
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: 420, width: "100%" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              margin: "0 0 8px",
              color: "#111111",
            }}
          >
            Algo salió mal
          </h1>
          <p style={{ fontSize: 14, color: "#666666", margin: "0 0 16px", lineHeight: 1.5 }}>
            Ocurrió un error inesperado. Reiniciá la app y si vuelve a pasar, fijate el
            error de abajo.
          </p>
          <pre
            style={{
              background: "#f4f4f5",
              color: "#444444",
              border: "1px solid #e4e4e7",
              padding: "12px",
              borderRadius: 8,
              fontSize: 12,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: "0 0 16px",
              fontFamily: "ui-monospace, monospace",
            }}
          >
            {error.message || "Error desconocido"}
          </pre>
          <button
            onClick={reset}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: "#111111",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
