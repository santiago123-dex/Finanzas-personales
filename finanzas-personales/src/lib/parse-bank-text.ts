export type ParsedBankText = {
  amount: number;
  type: "expense" | "income";
  description: string;
};

const INCOME_HINTS =
  /\b(recibiste|te enviaron|te transfirieron|te lleg[oó]|dep[oó]sito|abono|te pagaron|ingreso|rendimientos?)\b/i;

// Montos tipo "$25.000", "$ 1.234.567,89", "COP 25.000", "25000".
const AMOUNT_RE = /(?:\$|COP|COL\$)\s*([\d][\d.,]*)|([\d][\d.,]*)\s*(?:COP|pesos)\b/i;

function toNumber(raw: string): number {
  const s = raw.replace(/[.,]+$/, "");
  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");

  if (lastDot !== -1 && lastComma !== -1) {
    const decimalSep = lastDot > lastComma ? "." : ",";
    const thousandSep = decimalSep === "." ? "," : ".";
    return Number(s.split(thousandSep).join("").replace(decimalSep, "."));
  }
  if (lastComma !== -1) {
    return /,\d{1,2}$/.test(s)
      ? Number(s.replace(",", "."))
      : Number(s.replace(/,/g, ""));
  }
  if (lastDot !== -1) {
    return /\.\d{1,2}$/.test(s) && !/^\d{1,3}(\.\d{3})+$/.test(s)
      ? Number(s)
      : Number(s.replace(/\./g, ""));
  }
  return Number(s);
}

function extractMerchant(text: string): string {
  const patterns = [
    /\ben\s+([A-Za-z0-9ÁÉÍÓÚÑáéíóúñ&*'._\- ]{2,40}?)(?=\s+(?:por|con|el|la|a las|hoy|\$)|[.,\n]|$)/i,
    /\b(?:a|de)\s+([A-Z][A-Za-z0-9ÁÉÍÓÚÑáéíóúñ&*'._\- ]{2,40}?)(?=\s+(?:por|con|el|la|a las|hoy|\$)|[.,\n]|$)/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return "";
}

/**
 * Extrae monto, tipo y comercio de un texto libre de banco (notificación,
 * correo, SMS o captura con OCR). Devuelve null si no encuentra un monto.
 */
export function parseBankText(text: string): ParsedBankText | null {
  const clean = text.replace(/\s+/g, " ").trim();
  const m = clean.match(AMOUNT_RE);
  if (!m) return null;

  const amount = toNumber(m[1] ?? m[2]);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return {
    amount,
    type: INCOME_HINTS.test(clean) ? "income" : "expense",
    description: extractMerchant(clean.replace(m[0], "")),
  };
}
