"use client";

import { useRef } from "react";

type PinInputProps = {
  length: number;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  labelPrefix?: string;
  idPrefix?: string;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

/**
 * Casillas controladas para códigos numéricos. El padre guarda el
 * string completo y decide qué hacer al completar (auto-submit, etc).
 */
export function PinInput({
  length,
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  labelPrefix = "Dígito",
  idPrefix = "pin",
}: PinInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  function focusBox(index: number) {
    inputsRef.current[index]?.focus();
    inputsRef.current[index]?.select();
  }

  function handleChange(index: number, raw: string) {
    const digit = onlyDigits(raw).slice(-1);
    if (!digit && raw !== "") return;
    const next = digits.map((d) => (d === " " ? "" : d));
    while (next.length < length) next.push("");
    next[index] = digit;
    onChange(next.join("").slice(0, length));
    if (digit && index < length - 1) focusBox(index + 1);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    const current = digits[index] === " " ? "" : digits[index];
    if (e.key === "Backspace" && !current && index > 0) {
      e.preventDefault();
      const next = digits.map((d) => (d === " " ? "" : d));
      while (next.length < length) next.push("");
      next[index - 1] = "";
      onChange(next.join("").slice(0, length));
      focusBox(index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) focusBox(index - 1);
    if (e.key === "ArrowRight" && index < length - 1) focusBox(index + 1);
  }

  function handlePaste(index: number, e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = onlyDigits(e.clipboardData.getData("text"));
    if (!pasted) return;
    const next = digits.map((d) => (d === " " ? "" : d));
    while (next.length < length) next.push("");
    for (let i = 0; i < pasted.length && index + i < length; i++) {
      next[index + i] = pasted[i];
    }
    onChange(next.join("").slice(0, length));
    focusBox(Math.min(index + pasted.length, length) - 1);
  }

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}>
      {digits.map((digit, i) => (
        <input
          key={`${idPrefix}-${i}`}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && i === 0}
          maxLength={1}
          aria-label={`${labelPrefix} ${i + 1} de ${length}`}
          value={digit === " " ? "" : digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className={`flex h-13 w-full items-center justify-center border bg-background text-center text-xl font-semibold tabular-nums outline-none transition-colors focus-visible:border-foreground focus-visible:shadow-[0_0_0_1px_var(--foreground)] disabled:opacity-60 ${
            digit !== " "
              ? "border-foreground"
              : "border-input hover:border-foreground/40"
          }`}
        />
      ))}
    </div>
  );
}
