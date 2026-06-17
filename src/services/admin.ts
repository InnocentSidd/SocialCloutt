import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "node:crypto";
import { db, ensureDb } from "@/lib/db";

// Custom Auth Middleware
const requireAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  await ensureDb();
  const vinxiHttp = "vinxi/http";
  const { getCookie } = await import(vinxiHttp);
  const sessionToken = getCookie("session_token");

  if (!sessionToken) {
    throw new Error("Unauthorized: No session token");
  }

  const res = await db.execute({
    sql: `SELECT users.id 
          FROM sessions 
          JOIN users ON sessions.user_id = users.id 
          WHERE sessions.id = ? AND sessions.expires_at > datetime('now')`,
    args: [sessionToken],
  });

  if (res.rows.length === 0) {
    throw new Error("Unauthorized: Invalid session");
  }

  const user = res.rows[0] as unknown as { id: string };

  return next({
    context: {
      userId: user.id,
    },
  });
});

async function assertAdmin(userId: string) {
  const roleRes = await db.execute({
    sql: "SELECT role FROM user_roles WHERE user_id = ? AND role = 'admin'",
    args: [userId],
  });
  if (roleRes.rows.length === 0) {
    throw new Error("Forbidden: User is not an admin");
  }
}

export const adminListApplications = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const res = await db.execute("SELECT * FROM applications ORDER BY created_at DESC");
    return res.rows.map((row) => ({
      id: String(row.id),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
      name: String(row.name),
      email: String(row.email),
      phone: row.phone ? String(row.phone) : null,
      status: String(row.status) as "new" | "reviewing" | "accepted" | "rejected",
      type: String(row.type) as "influencer" | "marketeer" | "brand",
      details: row.details ? JSON.parse(String(row.details)) : {},
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
    await db.execute({
      sql: "UPDATE applications SET status = ?, updated_at = datetime('now') WHERE id = ?",
      args: [data.status, data.id],
    });
    return { ok: true };
  });

export const adminDeleteApplication = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    await db.execute({
      sql: "DELETE FROM applications WHERE id = ?",
      args: [data.id],
    });
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
    if (data.id) {
      await db.execute({
        sql: `UPDATE campaigns SET 
                title = ?, client = ?, category = ?, cover_image = ?, description = ?, 
                results = ?, reach = ?, engagement = ?, feedback = ?, published = ?, sort_order = ?, updated_at = datetime('now') 
              WHERE id = ?`,
        args: [
          data.title,
          data.client || null,
          data.category || null,
          data.cover_image || null,
          data.description || null,
          data.results || null,
          data.reach || null,
          data.engagement || null,
          data.feedback || null,
          data.published ? 1 : 0,
          data.sort_order,
          data.id,
        ],
      });
    } else {
      const id = crypto.randomUUID();
      await db.execute({
        sql: `INSERT INTO campaigns 
                (id, title, client, category, cover_image, description, results, reach, engagement, feedback, published, sort_order) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          data.title,
          data.client || null,
          data.category || null,
          data.cover_image || null,
          data.description || null,
          data.results || null,
          data.reach || null,
          data.engagement || null,
          data.feedback || null,
          data.published ? 1 : 0,
          data.sort_order,
        ],
      });
    }
    return { ok: true };
  });

export const adminListCampaigns = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const res = await db.execute("SELECT * FROM campaigns ORDER BY sort_order ASC, created_at DESC");
    return res.rows.map((row) => ({
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
      gallery: row.gallery ? JSON.parse(String(row.gallery)) : [],
      published: Boolean(row.published),
      sort_order: Number(row.sort_order),
    }));
  });

export const adminDeleteCampaign = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    await db.execute({
      sql: "DELETE FROM campaigns WHERE id = ?",
      args: [data.id],
    });
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
    const res = await db.execute("SELECT * FROM team_members ORDER BY sort_order ASC");
    return res.rows.map((row) => ({
      id: String(row.id),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
      name: String(row.name),
      role: String(row.role),
      image: row.image ? String(row.image) : null,
      bio: row.bio ? String(row.bio) : null,
      socials: row.socials ? JSON.parse(String(row.socials)) : {},
      sort_order: Number(row.sort_order),
      published: Boolean(row.published),
    }));
  });

export const adminUpsertTeam = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(teamSchema)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    if (data.id) {
      await db.execute({
        sql: `UPDATE team_members SET 
                name = ?, role = ?, image = ?, bio = ?, sort_order = ?, published = ?, updated_at = datetime('now') 
              WHERE id = ?`,
        args: [
          data.name,
          data.role,
          data.image || null,
          data.bio || null,
          data.sort_order,
          data.published ? 1 : 0,
          data.id,
        ],
      });
    } else {
      const id = crypto.randomUUID();
      await db.execute({
        sql: `INSERT INTO team_members 
                (id, name, role, image, bio, sort_order, published) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          data.name,
          data.role,
          data.image || null,
          data.bio || null,
          data.sort_order,
          data.published ? 1 : 0,
        ],
      });
    }
    return { ok: true };
  });

export const adminDeleteTeam = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    await db.execute({
      sql: "DELETE FROM team_members WHERE id = ?",
      args: [data.id],
    });
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
    const res = await db.execute("SELECT * FROM testimonials ORDER BY sort_order ASC");
    return res.rows.map((row) => ({
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
    if (data.id) {
      await db.execute({
        sql: `UPDATE testimonials SET 
                author = ?, avatar = ?, quote = ?, role = ?, sort_order = ?, published = ?, updated_at = datetime('now') 
              WHERE id = ?`,
        args: [
          data.author,
          data.avatar || null,
          data.quote,
          data.role || null,
          data.sort_order,
          data.published ? 1 : 0,
          data.id,
        ],
      });
    } else {
      const id = crypto.randomUUID();
      await db.execute({
        sql: `INSERT INTO testimonials 
                (id, author, avatar, quote, role, sort_order, published) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          data.author,
          data.avatar || null,
          data.quote,
          data.role || null,
          data.sort_order,
          data.published ? 1 : 0,
        ],
      });
    }
    return { ok: true };
  });

export const adminDeleteTestimonial = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    await db.execute({
      sql: "DELETE FROM testimonials WHERE id = ?",
      args: [data.id],
    });
    return { ok: true };
  });

export const adminCheckRole = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const roleRes = await db.execute({
      sql: "SELECT role FROM user_roles WHERE user_id = ? AND role = 'admin'",
      args: [context.userId],
    });
    return { isAdmin: roleRes.rows.length > 0 };
  });
