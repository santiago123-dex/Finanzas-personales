"use client";

import { useState } from "react";
import { login, loginWithPin } from "@/app/actions/auth";

export function LoginForms() {
  const [mode, setMode] = useState<"pin" | "password">("pin");
  const [pending, setPending] = useState(false);

  return (
    <div className="space-y-5">
      <div
        role="tablist"
        aria-label="Método de ingreso"
        className="grid grid-cols-2 gap-1 rounded-none bg-muted p-1"
      >
        {(
          [
            { id: "pin", label: "Código" },
            { id: "password", label: "Contraseña" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mode === tab.id}
            onClick={() => {
              setMode(tab.id);
              setPending(false);
            }}
            className={`min-h-11 rounded-none px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
              mode === tab.id
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "pin" ? (
        <form
          key="pin"
          action={loginWithPin}
          onSubmit={() => setPending(true)}
          className="auth-form-enter space-y-5"
        >
          <div className="space-y-2">
            <label htmlFor="pin-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="pin-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="tu@email.com"
              className="auth-field"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pin-code" className="text-sm font-medium">
              Tu código
            </label>
            <input
              id="pin-code"
              name="pin"
              type="password"
              required
              inputMode="numeric"
              autoComplete="current-password"
              minLength={4}
              maxLength={6}
              pattern="[0-9]{4,6}"
              placeholder="••••"
              className="auth-field text-center text-xl font-semibold tracking-[0.5em] tabular-nums"
            />
          </div>

          <button
            type="submit"
            data-pressable
            disabled={pending}
            className="auth-submit disabled:pointer-events-none disabled:opacity-50"
          >
            {pending ? "Ingresando..." : "Ingresar con código"}
          </button>
        </form>
      ) : (
        <form
          key="password"
          action={login}
          onSubmit={() => setPending(true)}
          className="auth-form-enter space-y-5"
        >
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="tu@email.com"
              className="auth-field"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="auth-field"
            />
          </div>

          <button
            type="submit"
            data-pressable
            disabled={pending}
            className="auth-submit disabled:pointer-events-none disabled:opacity-50"
          >
            {pending ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      )}
    </div>
  );
}
