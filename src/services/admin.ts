import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "node:crypto";
import { supabase, ensureDb } from "@/lib/db";

// Custom Auth Middleware
const requireAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  await ensureDb();
  const vinxiHttp = "vinxi/http";
  const { getCookie } = await import(vinxiHttp);
  const sessionToken = getCookie("session_token");

  if (!sessionToken) {
    throw new Error("Unauthorized: No session token");
  }

  const { data: sessionData, error: sessionError } = await supabase
    .from("sessions")
    .select("id, users (id)")
    .eq("id", sessionToken)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (sessionError || !sessionData) {
    throw new Error("Unauthorized: Invalid session");
  }

  const user = (sessionData as any).users as { id: string } | null;
  if (!user) {
    throw new Error("Unauthorized: User not found");
  }

  return next({
    context: {
      userId: user.id,
    },
  });
});

async function assertAdmin(userId: string) {
  const { data: roleRes, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin");

  if (error || !roleRes || roleRes.length === 0) {
    throw new Error("Forbidden: User is not an admin");
  }
}

export const adminListApplications = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      throw new Error("Failed to load applications");
    }

    return data.map((row) => ({
      id: String(row.id),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
      name: String(row.name),
      email: String(row.email),
      phone: row.phone ? String(row.phone) : null,
      status: String(row.status) as "new" | "reviewing" | "accepted" | "rejected",
      type: String(row.type) as "influencer" | "marketeer" | "brand",
      details: typeof row.details === "string" ? JSON.parse(row.details) : (row.details || {}),
    }));
  });

export const adminUpdateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(
    z.object({
      id: z.string().uuid(),
      status: z.enum(["new", "reviewing", "accepted", "rejected"]),
    })
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await supabase
      .from("applications")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.id);

    if (error) {
      throw new Error("Failed to update application status");
    }
    return { ok: true };
  });

export const adminDeleteApplication = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", data.id);

    if (error) {
      throw new Error("Failed to delete application");
    }
    return { ok: true };
  });

const campaignSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(200),
  client: z.string().trim().max(200).optional().or(z.literal("")),
  category: z.string().trim().max(120).optional().or(z.literal("")),
  cover_image: z.string().trim().max(1000).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  results: z.string().trim().max(500).optional().or(z.literal("")),
  reach: z.string().trim().max(120).optional().or(z.literal("")),
  engagement: z.string().trim().max(120).optional().or(z.literal("")),
  feedback: z.string().trim().max(2000).optional().or(z.literal("")),
  published: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const adminUpsertCampaign = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(campaignSchema)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const payload = {
      title: data.title,
      client: data.client || null,
      category: data.category || null,
      cover_image: data.cover_image || null,
      description: data.description || null,
      results: data.results || null,
      reach: data.reach || null,
      engagement: data.engagement || null,
      feedback: data.feedback || null,
      published: data.published ? 1 : 0,
      sort_order: data.sort_order,
      updated_at: new Date().toISOString(),
    };

    if (data.id) {
      const { error } = await supabase
        .from("campaigns")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error("Failed to update campaign");
    } else {
      const { error } = await supabase
        .from("campaigns")
        .insert({ id: crypto.randomUUID(), ...payload });
      if (error) throw new Error("Failed to insert campaign");
    }
    return { ok: true };
  });

export const adminListCampaigns = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) {
      throw new Error("Failed to list campaigns");
    }

    return data.map((row) => ({
      id: String(row.id),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
      title: String(row.title),
      client: row.client ? String(row.client) : null,
      category: row.category ? String(row.category) : null,
      cover_image: row.cover_image ? String(row.cover_image) : null,
      description: row.description ? String(row.description) : null,
      results: row.results ? String(row.results) : null,
      reach: row.reach ? String(row.reach) : null,
      engagement: row.engagement ? String(row.engagement) : null,
      feedback: row.feedback ? String(row.feedback) : null,
      gallery: typeof row.gallery === "string" ? JSON.parse(row.gallery) : (row.gallery || []),
      published: Boolean(row.published),
      sort_order: Number(row.sort_order),
    }));
  });

export const adminDeleteCampaign = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", data.id);

    if (error) throw new Error("Failed to delete campaign");
    return { ok: true };
  });

const teamSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(200),
  image: z.string().trim().max(1000).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  sort_order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export const adminListTeam = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data) {
      throw new Error("Failed to list team members");
    }

    return data.map((row) => ({
      id: String(row.id),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
      name: String(row.name),
      role: String(row.role),
      image: row.image ? String(row.image) : null,
      bio: row.bio ? String(row.bio) : null,
      socials: typeof row.socials === "string" ? JSON.parse(row.socials) : (row.socials || {}),
      sort_order: Number(row.sort_order),
      published: Boolean(row.published),
    }));
  });

export const adminUpsertTeam = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(teamSchema)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const payload = {
      name: data.name,
      role: data.role,
      image: data.image || null,
      bio: data.bio || null,
      sort_order: data.sort_order,
      published: data.published ? 1 : 0,
      updated_at: new Date().toISOString(),
    };

    if (data.id) {
      const { error } = await supabase
        .from("team_members")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error("Failed to update team member");
    } else {
      const { error } = await supabase
        .from("team_members")
        .insert({ id: crypto.randomUUID(), ...payload });
      if (error) throw new Error("Failed to insert team member");
    }
    return { ok: true };
  });

export const adminDeleteTeam = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", data.id);

    if (error) throw new Error("Failed to delete team member");
    return { ok: true };
  });

const testimonialSchema = z.object({
  id: z.string().uuid().optional(),
  author: z.string().trim().min(1).max(200),
  role: z.string().trim().max(200).optional().or(z.literal("")),
  quote: z.string().trim().min(1).max(1000),
  avatar: z.string().trim().max(1000).optional().or(z.literal("")),
  published: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const adminListTestimonials = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data) {
      throw new Error("Failed to list testimonials");
    }

    return data.map((row) => ({
      id: String(row.id),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
      author: String(row.author),
      avatar: row.avatar ? String(row.avatar) : null,
      quote: String(row.quote),
      role: row.role ? String(row.role) : null,
      sort_order: Number(row.sort_order),
      published: Boolean(row.published),
    }));
  });

export const adminUpsertTestimonial = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(testimonialSchema)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const payload = {
      author: data.author,
      avatar: data.avatar || null,
      quote: data.quote,
      role: data.role || null,
      sort_order: data.sort_order,
      published: data.published ? 1 : 0,
      updated_at: new Date().toISOString(),
    };

    if (data.id) {
      const { error } = await supabase
        .from("testimonials")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error("Failed to update testimonial");
    } else {
      const { error } = await supabase
        .from("testimonials")
        .insert({ id: crypto.randomUUID(), ...payload });
      if (error) throw new Error("Failed to insert testimonial");
    }
    return { ok: true };
  });

export const adminDeleteTestimonial = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", data.id);

    if (error) throw new Error("Failed to delete testimonial");
    return { ok: true };
  });

export const adminCheckRole = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { data: roleRes, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin");

    return { isAdmin: !error && roleRes && roleRes.length > 0 };
  });

