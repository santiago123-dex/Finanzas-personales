"use client";

import { useState, useTransition } from "react";
import { generateBankToken } from "@/app/actions/pending";

export function ShortcutSetup() {
  const [token, setToken] = useState("");
  const [isPending, startTransition] = useTransition();
  const url =
    typeof window === "undefined" ? "" : `${window.location.origin}/api/inbox`;

  return (
    <details className="rounded-2xl border border-border p-4 text-sm">
      <summary className="cursor-pointer font-semibold">
        Conectar con un Atajo de iOS
      </summary>
      <div className="mt-3 space-y-3 text-muted-foreground">
        <p>
          Crea un Atajo con la acción <b>Obtener contenido de URL</b>: método
          POST, cuerpo JSON con el campo <code>text</code> (el texto del correo
          o SMS de Nu) y el encabezado{" "}
          <code>Authorization: Bearer &lt;tu token&gt;</code>.
        </p>
        <p className="break-all">
          URL: <code>{url}</code>
        </p>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => setToken(await generateBankToken()))
          }
          className="min-h-11 w-full rounded-xl border border-border font-semibold text-foreground hover:bg-muted disabled:opacity-50"
        >
          {token ? "Generar otro token" : "Generar token"}
        </button>
        {token && (
          <div className="space-y-1">
            <p>Cópialo ahora, no se vuelve a mostrar:</p>
            <code className="block break-all rounded-lg bg-muted p-2 text-foreground">
              {token}
            </code>
          </div>
        )}
      </div>
    </details>
  );
}
