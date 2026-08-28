import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(role: "user" | "admin"): TrpcContext {
  return { user: { id: 1, openId: `test-${role}`, name: role, email: `${role}@example.com`, loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("admin permissions", () => {
  it("rejects a normal user", async () => { await expect(appRouter.createCaller(context("user")).admin.scores()).rejects.toMatchObject({ code: "FORBIDDEN" }); });
  it("allows an admin to read operational scores", async () => { await expect(appRouter.createCaller(context("admin")).admin.scores()).resolves.toEqual([]); });
});
