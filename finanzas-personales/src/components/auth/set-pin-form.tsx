"use client";

import { useState } from "react";
import { setPin } from "@/app/actions/auth";
import { PinInput } from "./pin-input";

export function SetPinForm() {
  const [length, setLength] = useState<4 | 6>(6);
  const [pin, setPinValue] = useState("");
  const [confirm, setConfirmValue] = useState("");
  const [pending, setPending] = useState(false);

  const valid =
    pin.length === length &&
    confirm.length === length &&
    pin === confirm;

  function changeLength(next: 4 | 6) {
    setLength(next);
    setPinValue("");
    setConfirmValue("");
  }

  return (
    <form
      action={setPin}
      onSubmit={() => setPending(true)}
      className="space-y-5"
    >
      <div className="grid grid-cols-2 gap-1 rounded-none bg-muted p-1">
        {([4, 6] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => changeLength(n)}
            aria-pressed={length === n}
            className={`min-h-11 rounded-none px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
              length === n
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {n} dígitos
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <span id="pin-label" className="text-sm font-medium">
          Elegí tu código
        </span>
        <div role="group" aria-labelledby="pin-label">
          <PinInput
            length={length}
            value={pin}
            onChange={setPinValue}
            disabled={pending}
            autoFocus
            idPrefix="pin-new"
            labelPrefix="Dígito del código nuevo"
          />
        </div>
        <input type="hidden" name="pin" value={pin} />
      </div>

      <div className="space-y-2">
        <span id="pin-confirm-label" className="text-sm font-medium">
          Repetilo para confirmar
        </span>
        <div role="group" aria-labelledby="pin-confirm-label">
          <PinInput
            length={length}
            value={confirm}
            onChange={setConfirmValue}
            disabled={pending}
            idPrefix="pin-confirm"
            labelPrefix="Dígito de confirmación"
          />
        </div>
        <input type="hidden" name="confirm" value={confirm} />
      </div>

      {pin.length === length &&
        confirm.length === length &&
        pin !== confirm && (
          <p role="alert" className="text-xs text-muted-foreground">
            Los códigos no coinciden. Revisalos.
          </p>
        )}

      <button
        type="submit"
        data-pressable
        disabled={pending || !valid}
        className="auth-submit disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar mi código"}
      </button>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Va a ser tu forma rápida de entrar en este y otros dispositivos. No lo
        compartas: con tu email y este código se abre tu cuenta.
      </p>
    </form>
  );
}
