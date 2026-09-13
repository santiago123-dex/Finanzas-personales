"use client";

import { useEffect, useRef, useState } from "react";
import { resendCode, verifyCode } from "@/app/actions/auth";
import { PinInput } from "./pin-input";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_S = 30;

export function VerifyForm({ email }: { email: string }) {
  const [emailState, setEmailState] = useState(email);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(email ? RESEND_COOLDOWN_S : 0);
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);

  const activeEmail = (email || emailState).trim();

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(
      () => setCooldown((s) => (s > 0 ? s - 1 : 0)),
      1000
    );
    return () => clearInterval(id);
  }, [cooldown]);

  function handleCodeChange(next: string) {
    setCode(next);
    if (next.length === CODE_LENGTH) {
      if (!submittedRef.current) {
        submittedRef.current = true;
        setPending(true);
        // Deja que React pinte el último dígito antes de navegar.
        requestAnimationFrame(() => formRef.current?.requestSubmit());
      }
    } else {
      submittedRef.current = false;
    }
  }

  return (
    <div className="space-y-5">
      <form
        ref={formRef}
        action={verifyCode}
        onSubmit={() => setPending(true)}
        className="space-y-5"
      >
        {email ? (
          <>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Te enviamos un código de 6 dígitos a{" "}
              <span className="font-medium break-all text-foreground">
                {email}
              </span>
              .
            </p>
            <input type="hidden" name="email" value={email} />
          </>
        ) : (
          <div className="space-y-2">
            <label htmlFor="verify-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="verify-email"
              name="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              placeholder="tu@email.com"
              value={emailState}
              onChange={(e) => setEmailState(e.target.value)}
              className="auth-field"
            />
          </div>
        )}

        <div className="space-y-2">
          <span id="otp-label" className="text-sm font-medium">
            Código de 6 dígitos
          </span>
          <div role="group" aria-labelledby="otp-label">
            <PinInput
              length={CODE_LENGTH}
              value={code}
              onChange={handleCodeChange}
              disabled={pending}
              autoFocus={email !== ""}
            />
          </div>
          <input type="hidden" name="token" value={code} />
        </div>

        <button
          type="submit"
          data-pressable
          disabled={pending || code.length !== CODE_LENGTH}
          className="auth-submit disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? "Verificando..." : "Verificar e ingresar"}
        </button>
      </form>

      <form action={resendCode} className="flex items-center justify-between gap-3">
        <input type="hidden" name="email" value={activeEmail} />
        <p className="text-xs text-muted-foreground">
          ¿No te llegó? Revisá spam.
        </p>
        <button
          type="submit"
          disabled={cooldown > 0 || !activeEmail}
          onClick={() => setCooldown(RESEND_COOLDOWN_S)}
          className="min-h-9 shrink-0 text-xs font-medium text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar código"}
        </button>
      </form>
    </div>
  );
}
