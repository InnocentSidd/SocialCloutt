import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "node:crypto";
import { supabase, ensureDb, hashPassword, verifyPassword } from "@/lib/db";

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
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", data.email.toLowerCase())
      .maybeSingle();

    if (userError || !userData) {
      throw new Error("Invalid email or password");
    }

    const user = userData as { id: string; email: string; password_hash: string };

    const valid = verifyPassword(data.password, user.password_hash);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    // Check if user has admin role
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (rolesError || !roles) {
      throw new Error("Forbidden: User roles could not be loaded");
    }

    const isAdmin = roles.some((r) => r.role === "admin");
    if (!isAdmin) {
      throw new Error("Forbidden: User is not an admin");
    }

    // Generate session
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days

    const { error: sessionError } = await supabase
      .from("sessions")
      .insert({ id: sessionToken, user_id: user.id, expires_at: expiresAt });

    if (sessionError) {
      throw new Error("Failed to create session");
    }

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
    const { data: existsData, error: existsError } = await supabase
      .from("users")
      .select("id")
      .eq("email", data.email.toLowerCase())
      .maybeSingle();

    if (existsData) {
      throw new Error("User already exists");
    }

    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(data.password);

    // Insert user
    const { error: userInsertError } = await supabase
      .from("users")
      .insert({ id: userId, email: data.email.toLowerCase(), password_hash: passwordHash });

    if (userInsertError) {
      throw new Error("Failed to create user");
    }

    // Automatically make them admin for the admin panel
    const { error: roleInsertError } = await supabase
      .from("user_roles")
      .insert({ id: crypto.randomUUID(), user_id: userId, role: "admin" });

    if (roleInsertError) {
      throw new Error("Failed to assign user role");
    }

    // Create session to auto sign in
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days

    const { error: sessionInsertError } = await supabase
      .from("sessions")
      .insert({ id: sessionToken, user_id: userId, expires_at: expiresAt });

    if (sessionInsertError) {
      throw new Error("Failed to create session");
    }

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
      await supabase
        .from("sessions")
        .delete()
        .eq("id", sessionToken);
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
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .select("id, expires_at, users (id, email)")
      .eq("id", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (sessionError || !sessionData) {
      deleteCookie("session_token", { path: "/" });
      throw new Error("Unauthorized: Invalid or expired session");
    }

    const user = (sessionData as any).users as { id: string; email: string } | null;
    if (!user) {
      deleteCookie("session_token", { path: "/" });
      throw new Error("Unauthorized: User not found");
    }

    return { id: user.id, email: user.email };
  });

