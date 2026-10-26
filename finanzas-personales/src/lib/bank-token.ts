import { createHash, randomBytes } from "node:crypto";

export function newBankToken() {
  return `fp_${randomBytes(24).toString("hex")}`;
}

export function hashBankToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
