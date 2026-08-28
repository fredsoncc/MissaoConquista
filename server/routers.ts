import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { addContact, addScore, createRoom, findRoomByCode, getUserByOpenId, joinRoom, leaveRoom, listRooms, saveRoomState, topScores } from "./db";

const roomInput = z.object({ name: z.string().min(3).max(120) });
export const appRouter = router({
  system: systemRouter,
  auth: router({ me: publicProcedure.query(opts => opts.ctx.user), logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }) }),
  rooms: router({
    list: publicProcedure.query(() => listRooms()),
    create: protectedProcedure.input(roomInput).mutation(async ({ ctx, input }) => createRoom({ name: input.name, code: Math.random().toString(36).slice(2, 7).toUpperCase(), createdBy: ctx.user.id, stateJson: JSON.stringify({ turn: 1, phase: 'planning' }) })),
    join: protectedProcedure.input(z.object({ code: z.string().min(5).max(12) })).mutation(async ({ ctx, input }) => { const room = await findRoomByCode(input.code.toUpperCase()); if (!room) return null; await joinRoom(room.id, ctx.user.id); return room; }),
    leave: protectedProcedure.input(z.object({ roomId: z.number() })).mutation(({ ctx, input }) => leaveRoom(input.roomId, ctx.user.id)),
    saveState: protectedProcedure.input(z.object({ roomId: z.number(), stateJson: z.string(), status: z.enum(['open', 'playing', 'finished']).optional() })).mutation(({ input }) => saveRoomState(input.roomId, input.stateJson, input.status)),
  }),
  scores: router({
    top: publicProcedure.query(() => topScores()),
    submit: protectedProcedure.input(z.object({ playerName: z.string().min(1).max(120), points: z.number().int().min(0), turns: z.number().int().min(1) })).mutation(({ ctx, input }) => addScore({ ...input, userId: ctx.user.id })),
  }),
  contacts: router({ add: protectedProcedure.input(z.object({ contactUserId: z.number() })).mutation(({ ctx, input }) => addContact(ctx.user.id, input.contactUserId)) }),
});
export type AppRouter = typeof appRouter;
