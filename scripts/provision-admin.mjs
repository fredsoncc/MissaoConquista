import mysql from "mysql2/promise";
import { randomBytes, scryptSync } from "node:crypto";

function hashPassword(password) { const salt = randomBytes(16).toString("hex"); return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`; }

const db = await mysql.createConnection(process.env.DATABASE_URL);
const [columns] = await db.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'");
const names = new Set(columns.map((column) => column.COLUMN_NAME));
if (!names.has("username")) await db.query("ALTER TABLE users ADD username varchar(64) NULL UNIQUE");
if (!names.has("passwordHash")) await db.query("ALTER TABLE users ADD passwordHash text NULL");
if (!names.has("mustChangePassword")) await db.query("ALTER TABLE users ADD mustChangePassword boolean NOT NULL DEFAULT false");
const [rows] = await db.query("SELECT id FROM users WHERE username = ? LIMIT 1", ["admin"]);
if (!rows.length) {
  await db.query("INSERT INTO users (openId, username, passwordHash, mustChangePassword, name, loginMethod, role) VALUES (?, ?, ?, ?, ?, ?, ?)", ["local:admin", "admin", hashPassword("admin"), true, "admin", "local", "admin"]);
}
await db.end();
console.log("initial admin ready");
