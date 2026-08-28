import { z } from "zod";
import { SignJWT } from "jose";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME, LOCAL_COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { addContact, addScore, createLocalUser, createRoom, ensureInitialAdmin, findRoomByCode, getUserByOpenId, getUserByUsername, joinRoom, leaveRoom, listRooms, saveRoomState, topScores, updateLocalPassword } from "./db";
import { hashPassword, verifyPassword } from "./auth/local";

const roomInput = z.object({ name: z.string().min(3).max(120) });
const adminProcedure = protectedProcedure.use(({ ctx, next }) => { if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso administrativo necessário." }); if (ctx.user.mustChangePassword) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Troque a senha temporária antes de acessar o painel." }); return next(); });
const cookieMaxAge = 1000 * 60 * 60 * 24 * 7;

async function signLocalSession(openId: string) { return new SignJWT({ openId, kind: "local" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(new TextEncoder().encode(ENV.cookieSecret)); }

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    register: publicProcedure.input(z.object({ username: z.string().trim().min(3).max(64), password: z.string().min(12).max(128) })).mutation(async ({ input }) => { const username = input.username.toLowerCase(); if (await getUserByUsername(username)) throw new TRPCError({ code: "CONFLICT", message: "Usuário já cadastrado." }); const user = await createLocalUser(username, hashPassword(input.password)); return { success: Boolean(user) }; }),
    localLogin: publicProcedure.input(z.object({ username: z.string().min(1).max(64), password: z.string().min(1).max(128) })).mutation(async ({ ctx, input }) => { const username = input.username.trim().toLowerCase(); const user = await ensureInitialAdmin("admin", "admin"); const account = username === "admin" ? user : await getUserByUsername(username); if (!account?.passwordHash || !verifyPassword(input.password, account.passwordHash)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário ou senha inválidos." }); const token = await signLocalSession(account.openId); ctx.res.cookie(LOCAL_COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: cookieMaxAge }); return { user: { id: account.id, name: account.name, username: account.username, role: account.role }, mustChangePassword: account.mustChangePassword }; }),
    changePassword: protectedProcedure.input(z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(12).max(128) })).mutation(async ({ ctx, input }) => { if (!ctx.user.passwordHash || !verifyPassword(input.currentPassword, ctx.user.passwordHash)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Senha atual inválida." }); if (input.newPassword.toLowerCase() === "adminadmin" || input.newPassword.toLowerCase() === "admin") throw new TRPCError({ code: "BAD_REQUEST", message: "Escolha uma senha diferente da temporária." }); await updateLocalPassword(ctx.user.id, hashPassword(input.newPassword)); const updated = await getUserByOpenId(ctx.user.openId); return { success: true, mustChangePassword: false, user: updated }; }),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); ctx.res.clearCookie(LOCAL_COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  rooms: router({ list: publicProcedure.query(() => listRooms()), create: protectedProcedure.input(roomInput).mutation(async ({ ctx, input }) => createRoom({ name: input.name, code: Math.random().toString(36).slice(2, 7).toUpperCase(), createdBy: ctx.user.id, stateJson: JSON.stringify({ turn: 1, phase: "planning" }) })), join: protectedProcedure.input(z.object({ code: z.string().min(5).max(12) })).mutation(async ({ ctx, input }) => { const room = await findRoomByCode(input.code.toUpperCase()); if (!room) return null; await joinRoom(room.id, ctx.user.id); return room; }), leave: protectedProcedure.input(z.object({ roomId: z.number() })).mutation(({ ctx, input }) => leaveRoom(input.roomId, ctx.user.id)), saveState: protectedProcedure.input(z.object({ roomId: z.number(), stateJson: z.string(), status: z.enum(["open", "playing", "finished"]).optional() })).mutation(({ input }) => saveRoomState(input.roomId, input.stateJson, input.status)), }),
  scores: router({ top: publicProcedure.query(() => topScores()), submit: protectedProcedure.input(z.object({ playerName: z.string().min(1).max(120), points: z.number().int().min(0), turns: z.number().int().min(1) })).mutation(({ ctx, input }) => addScore({ ...input, userId: ctx.user.id })) }),
  contacts: router({ add: protectedProcedure.input(z.object({ contactUserId: z.number() })).mutation(({ ctx, input }) => addContact(ctx.user.id, input.contactUserId)) }),
  admin: router({ scores: adminProcedure.query(() => topScores()) }),
});
export type AppRouter = typeof appRouter;
