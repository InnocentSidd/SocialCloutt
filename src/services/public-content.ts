import { createServerFn } from "@tanstack/react-start";
import { supabase, ensureDb } from "@/lib/db";

export const listPublicCampaigns = createServerFn({ method: "GET" }).handler(async () => {
  await ensureDb();
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("id, title, client, category, cover_image, description, results, reach, engagement, sort_order")
      .eq("published", 1)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) {
      throw error || new Error("Failed to load campaigns");
    }

    return data.map((row) => ({
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
    const { data, error } = await supabase
      .from("team_members")
      .select("id, name, role, image, bio, socials, sort_order")
      .eq("published", 1)
      .order("sort_order", { ascending: true });

    if (error || !data) {
      throw error || new Error("Failed to load team");
    }

    return data.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      role: String(row.role),
      image: row.image ? String(row.image) : null,
      bio: row.bio ? String(row.bio) : null,
      socials: typeof row.socials === "string" ? JSON.parse(row.socials) : (row.socials || {}),
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
    const { data, error } = await supabase
      .from("testimonials")
      .select("id, author, role, quote, avatar, sort_order")
      .eq("published", 1)
      .order("sort_order", { ascending: true });

    if (error || !data) {
      throw error || new Error("Failed to load testimonials");
    }

    return data.map((row) => ({
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

