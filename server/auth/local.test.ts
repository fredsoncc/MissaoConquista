import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./local";

describe("local password auth", () => {
  it("hashes and verifies passwords without storing plaintext", () => {
    const hash = hashPassword("admin");
    expect(hash).not.toBe("admin");
    expect(verifyPassword("admin", hash)).toBe(true);
    expect(verifyPassword("wrong-password", hash)).toBe(false);
  });
});
