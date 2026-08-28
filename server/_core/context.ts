import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import { getUserByOpenId } from "../db";
import { LOCAL_COOKIE_NAME } from "../../shared/const";
import { ENV } from "./env";
import { sdk } from "./sdk";

export type TrpcContext = { req: CreateExpressContextOptions["req"]; res: CreateExpressContextOptions["res"]; user: User | null };

function readCookie(header: string | undefined, name: string) {
  return header?.split(";").map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1);
}

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  try { user = await sdk.authenticateRequest(opts.req); } catch { user = null; }
  if (!user && ENV.cookieSecret) {
    try {
      const token = readCookie(opts.req.headers.cookie, LOCAL_COOKIE_NAME);
      if (token) {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(ENV.cookieSecret));
        if (typeof payload.openId === "string") user = (await getUserByOpenId(payload.openId)) ?? null;
      }
    } catch { user = null; }
  }
  return { req: opts.req, res: opts.res, user };
}
