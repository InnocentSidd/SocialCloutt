import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "node:crypto";
import { db, ensureDb, hashPassword, verifyPassword } from "@/lib/db";

const authSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

const VINXI_HTTP = "vinxi/http";

export const loginFn = createServerFn({ method: "POST" })
  .validator(authSchema)
  .handler(async ({ data }) => {
    await ensureDb();

    // Query user
    const userRes = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [data.email.toLowerCase()],
    });

    if (userRes.rows.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = userRes.rows[0] as unknown as { id: string; email: string; password_hash: string };

    const valid = verifyPassword(data.password, user.password_hash);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    // Check if user has admin role
    const roleRes = await db.execute({
      sql: "SELECT role FROM user_roles WHERE user_id = ?",
      args: [user.id],
    });
    const isAdmin = roleRes.rows.some((r) => r.role === "admin");
    if (!isAdmin) {
      throw new Error("Forbidden: User is not an admin");
    }

    // Generate session
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days

    await db.execute({
      sql: "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
      args: [sessionToken, user.id, expiresAt],
    });

    // Set cookie
    const { setCookie } = await import(VINXI_HTTP);
    setCookie("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { id: user.id, email: user.email };
  });

export const signupFn = createServerFn({ method: "POST" })
  .validator(authSchema)
  .handler(async ({ data }) => {
    await ensureDb();

    // Check if user already exists
    const existsRes = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [data.email.toLowerCase()],
    });

    if (existsRes.rows.length > 0) {
      throw new Error("User already exists");
    }

    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(data.password);

    // Insert user
    await db.execute({
      sql: "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
      args: [userId, data.email.toLowerCase(), passwordHash],
    });

    // Automatically make them admin for the admin panel
    await db.execute({
      sql: "INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)",
      args: [crypto.randomUUID(), userId, "admin"],
    });

    // Create session to auto sign in
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days

    await db.execute({
      sql: "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
      args: [sessionToken, userId, expiresAt],
    });

    // Set cookie
    const { setCookie } = await import(VINXI_HTTP);
    setCookie("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { id: userId, email: data.email };
  });

export const logoutFn = createServerFn({ method: "POST" })
  .handler(async () => {
    await ensureDb();
    const { getCookie, deleteCookie } = await import(VINXI_HTTP);
    const sessionToken = getCookie("session_token");

    if (sessionToken) {
      await db.execute({
        sql: "DELETE FROM sessions WHERE id = ?",
        args: [sessionToken],
      });
      deleteCookie("session_token", { path: "/" });
    }

    return { ok: true };
  });

export const checkAuthFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureDb();
    const { getCookie, deleteCookie } = await import(VINXI_HTTP);
    const sessionToken = getCookie("session_token");

    if (!sessionToken) {
      throw new Error("Unauthorized: No session token");
    }

    // Query active session
    const res = await db.execute({
      sql: `SELECT users.id, users.email 
            FROM sessions 
            JOIN users ON sessions.user_id = users.id 
            WHERE sessions.id = ? AND sessions.expires_at > datetime('now')`,
      args: [sessionToken],
    });

    if (res.rows.length === 0) {
      deleteCookie("session_token", { path: "/" });
      throw new Error("Unauthorized: Invalid or expired session");
    }

    const user = res.rows[0] as unknown as { id: string; email: string };
    return { id: user.id, email: user.email };
  });
