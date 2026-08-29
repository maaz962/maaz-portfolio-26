import crypto from "crypto";

/** Hash a password using scrypt with a per-user random salt.
 * Format: "scrypt$<salt-hex>$<hash-hex>" */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

/** Constant-time password verification. Supports legacy unsalted SHA-256 hashes. */
export function verifyPassword(password: string, stored: string): boolean {
  try {
    if (stored.startsWith("scrypt$")) {
      const [, salt, hash] = stored.split("$");
      if (!salt || !hash) return false;
      const candidate = crypto.scryptSync(password, salt, 64);
      return crypto.timingSafeEqual(Buffer.from(hash, "hex"), candidate);
    }
    // Legacy format: bare hex SHA-256 (pre-upgrade seeds)
    const legacy = crypto.createHash("sha256").update(password).digest("hex");
    if (legacy.length !== stored.length) return false;
    return crypto.timingSafeEqual(Buffer.from(legacy), Buffer.from(stored));
  } catch {
    return false;
  }
}
