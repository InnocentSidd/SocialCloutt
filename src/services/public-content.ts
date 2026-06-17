import { createServerFn } from "@tanstack/react-start";
import { db, ensureDb } from "@/lib/db";

export const listPublicCampaigns = createServerFn({ method: "GET" }).handler(async () => {
  await ensureDb();
  try {
    const res = await db.execute(`
      SELECT id, title, client, category, cover_image, description, results, reach, engagement, sort_order 
      FROM campaigns 
      WHERE published = 1 
      ORDER BY sort_order ASC, created_at DESC
    `);
    return res.rows.map((row) => ({
      id: String(row.id),
      title: String(row.title),
      client: row.client ? String(row.client) : null,
      category: row.category ? String(row.category) : null,
      cover_image: row.cover_image ? String(row.cover_image) : null,
      description: row.description ? String(row.description) : null,
      results: row.results ? String(row.results) : null,
      reach: row.reach ? String(row.reach) : null,
      engagement: row.engagement ? String(row.engagement) : null,
      sort_order: Number(row.sort_order),
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
});

export const listPublicTeam = createServerFn({ method: "GET" }).handler(async () => {
  await ensureDb();
  try {
    const res = await db.execute(`
      SELECT id, name, role, image, bio, socials, sort_order 
      FROM team_members 
      WHERE published = 1 
      ORDER BY sort_order ASC
    `);
    return res.rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      role: String(row.role),
      image: row.image ? String(row.image) : null,
      bio: row.bio ? String(row.bio) : null,
      socials: row.socials ? JSON.parse(String(row.socials)) : {},
      sort_order: Number(row.sort_order),
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
});

export const listPublicTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  await ensureDb();
  try {
    const res = await db.execute(`
      SELECT id, author, role, quote, avatar, sort_order 
      FROM testimonials 
      WHERE published = 1 
      ORDER BY sort_order ASC
    `);
    return res.rows.map((row) => ({
      id: String(row.id),
      author: String(row.author),
      role: row.role ? String(row.role) : null,
      quote: String(row.quote),
      avatar: row.avatar ? String(row.avatar) : null,
      sort_order: Number(row.sort_order),
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
});
