import { describe, expect, it } from "vitest";
import { getInitialAdminCredentials } from "./auth/local";

describe("initial admin secret", () => {
  it("is configured without exposing the password", () => {
    const credentials = getInitialAdminCredentials();
    expect(credentials.username.length).toBeGreaterThanOrEqual(3);
    expect(credentials.password.length).toBeGreaterThanOrEqual(12);
    expect(credentials.password).not.toContain(credentials.username);
  });
});
