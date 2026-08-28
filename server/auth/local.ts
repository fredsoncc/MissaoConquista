import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function getInitialAdminCredentials() {
  const username = process.env.ADMIN_INITIAL_USERNAME ?? "";
  const password = process.env.ADMIN_INITIAL_PASSWORD ?? "";
  if (!username || !password) throw new Error("ADMIN_INITIAL_USERNAME e ADMIN_INITIAL_PASSWORD precisam estar configurados.");
  return { username, password };
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && timingSafeEqual(derived, expected);
}
