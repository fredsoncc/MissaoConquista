import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, rooms, roomMembers, scores, contacts } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() { if (!_db && process.env.DATABASE_URL) { try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn('[Database] Failed to connect:', error); } } return _db; }
export async function upsertUser(user: InsertUser): Promise<void> { if (!user.openId) throw new Error('User openId is required for upsert'); const db = await getDb(); if (!db) return; const values: InsertUser = { openId: user.openId, name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: user.lastSignedIn ?? new Date() }; await db.insert(users).values(values).onDuplicateKeyUpdate({ set: { name: values.name, email: values.email, loginMethod: values.loginMethod, lastSignedIn: values.lastSignedIn } }); }
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return rows[0]; }
export async function listRooms() { const db = await getDb(); if (!db) return []; return db.select().from(rooms).orderBy(desc(rooms.updatedAt)).limit(50); }
export async function createRoom(input: { code: string; name: string; createdBy: number; stateJson: string }) { const db = await getDb(); if (!db) return null; const result = await db.insert(rooms).values(input); return { id: Number(result[0].insertId), ...input, status: 'open' as const }; }
export async function findRoomByCode(code: string) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(rooms).where(eq(rooms.code, code)).limit(1); return rows[0]; }
export async function saveRoomState(roomId: number, stateJson: string, status: 'open' | 'playing' | 'finished' = 'playing') { const db = await getDb(); if (!db) return; await db.update(rooms).set({ stateJson, status }).where(eq(rooms.id, roomId)); }
export async function joinRoom(roomId: number, userId: number) { const db = await getDb(); if (!db) return; await db.insert(roomMembers).values({ roomId, userId }); }
export async function leaveRoom(roomId: number, userId: number) { const db = await getDb(); if (!db) return; const membership = await db.select({ id: roomMembers.id }).from(roomMembers).where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId))); const ownMembership = membership[0]; if (ownMembership) await db.delete(roomMembers).where(eq(roomMembers.id, ownMembership.id)); }
export async function addScore(input: { userId: number; playerName: string; points: number; turns: number }) { const db = await getDb(); if (!db) return; await db.insert(scores).values(input); }
export async function topScores() { const db = await getDb(); if (!db) return []; return db.select().from(scores).orderBy(desc(scores.points), desc(scores.createdAt)).limit(10); }
export async function addContact(userId: number, contactUserId: number) { const db = await getDb(); if (!db) return; await db.insert(contacts).values({ userId, contactUserId }); }
