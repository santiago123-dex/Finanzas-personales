"use client";

import { useEffect, useRef, useState } from "react";
import { resendCode, verifyCode } from "@/app/actions/auth";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_S = 30;

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function VerifyForm({ email }: { email: string }) {
  const [emailState, setEmailState] = useState(email);
  const [digits, setDigits] = useState<string[]>(() =>
    Array<string>(CODE_LENGTH).fill("")
  );
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(email ? RESEND_COOLDOWN_S : 0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);

  const activeEmail = (email || emailState).trim();
  const code = digits.join("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(
      () => setCooldown((s) => (s > 0 ? s - 1 : 0)),
      1000
    );
    return () => clearInterval(id);
  }, [cooldown]);

  function focusBox(index: number) {
    inputsRef.current[index]?.focus();
    inputsRef.current[index]?.select();
  }

  function submitWhenComplete(next: string[]) {
    if (next.join("").length === CODE_LENGTH && !submittedRef.current) {
      submittedRef.current = true;
      setPending(true);
      // Deja que React pinte el último dígito antes de navegar.
      requestAnimationFrame(() => formRef.current?.requestSubmit());
    }
  }

  function handleChange(index: number, value: string) {
    const digit = onlyDigits(value).slice(-1);
    if (!digit && value !== "") return;
    const next = [...digits];
    next[index] = digit;
    submittedRef.current = false;
    setDigits(next);
    if (digit && index < CODE_LENGTH - 1) focusBox(index + 1);
    submitWhenComplete(next);
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      const next = [...digits];
      next[index - 1] = "";
      submittedRef.current = false;
      setDigits(next);
      focusBox(index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) focusBox(index - 1);
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1)
      focusBox(index + 1);
  }

  function handlePaste(
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) {
    e.preventDefault();
    const pasted = onlyDigits(e.clipboardData.getData("text"));
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length && index + i < CODE_LENGTH; i++) {
      next[index + i] = pasted[i];
    }
    submittedRef.current = false;
    setDigits(next);
    const lastFilled = Math.min(index + pasted.length, CODE_LENGTH) - 1;
    focusBox(lastFilled);
    submitWhenComplete(next);
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
          <label
            id="otp-label"
            className="text-sm font-medium"
          >
            Código de 6 dígitos
          </label>
          <div
            role="group"
            aria-labelledby="otp-label"
            className="grid grid-cols-6 gap-2"
          >
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                autoFocus={i === 0 && email !== ""}
                maxLength={1}
                required
                aria-label={`Dígito ${i + 1} del código`}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={(e) => handlePaste(i, e)}
                onFocus={(e) => e.target.select()}
                disabled={pending}
                className={`flex h-13 w-full items-center justify-center border bg-background text-center text-xl font-semibold tabular-nums outline-none transition-colors placeholder:text-muted-foreground/40 focus-visible:border-foreground focus-visible:shadow-[0_0_0_1px_var(--foreground)] disabled:opacity-60 ${
                  digit
                    ? "border-foreground"
                    : "border-input hover:border-foreground/40"
                }`}
              />
            ))}
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
