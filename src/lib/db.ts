import { createClient } from "@libsql/client";
import process from "node:process";
import crypto from "node:crypto";

const isVercel = !!(process.env.VERCEL || process.env.NOW_BUILDER);
const dbUrl = isVercel ? "file:/tmp/local.db" : "file:local.db";

export const db = createClient({
  url: dbUrl,
});

let initPromise: Promise<void> | null = null;

// Helper to hash passwords using pbkdf2
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [salt, originalHash] = parts;
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

export async function ensureDb() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Create tables
      await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS user_roles (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role TEXT NOT NULL
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TEXT NOT NULL
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS applications (
          id TEXT PRIMARY KEY,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          status TEXT NOT NULL DEFAULT 'new',
          type TEXT NOT NULL,
          details TEXT NOT NULL
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS campaigns (
          id TEXT PRIMARY KEY,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          title TEXT NOT NULL,
          client TEXT,
          category TEXT,
          cover_image TEXT,
          description TEXT,
          results TEXT,
          reach TEXT,
          engagement TEXT,
          feedback TEXT,
          gallery TEXT NOT NULL DEFAULT '[]',
          published INTEGER NOT NULL DEFAULT 1,
          sort_order INTEGER NOT NULL DEFAULT 0
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS team_members (
          id TEXT PRIMARY KEY,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          image TEXT,
          bio TEXT,
          socials TEXT NOT NULL DEFAULT '{}',
          sort_order INTEGER NOT NULL DEFAULT 0,
          published INTEGER NOT NULL DEFAULT 1
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS testimonials (
          id TEXT PRIMARY KEY,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          author TEXT NOT NULL,
          avatar TEXT,
          quote TEXT NOT NULL,
          role TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
          published INTEGER NOT NULL DEFAULT 1
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS site_content (
          key TEXT PRIMARY KEY,
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          value TEXT NOT NULL
        )
      `);

      // Check if users exist. If not, seed a default admin user.
      const usersRes = await db.execute("SELECT count(*) as count FROM users");
      const userCount = Number(usersRes.rows[0].count);

      if (userCount === 0) {
        console.log("[SQLite] Seeding default admin user...");
        const userId = crypto.randomUUID();
        const email = "admin@socialcloutt.com";
        const passwordHash = hashPassword("password"); // Default password: password

        await db.execute({
          sql: "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
          args: [userId, email, passwordHash],
        });

        await db.execute({
          sql: "INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)",
          args: [crypto.randomUUID(), userId, "admin"],
        });
        console.log(`[SQLite] Seeded admin user: ${email} / password`);
      }

      // Check campaigns
      const campaignsRes = await db.execute("SELECT count(*) as count FROM campaigns");
      if (Number(campaignsRes.rows[0].count) === 0) {
        console.log("[SQLite] Seeding campaigns...");
        const seedCampaigns = [
          {
            id: crypto.randomUUID(),
            title: "FENTY BEAUTY: Shade of You",
            client: "Fenty Beauty",
            category: "Influencer Marketing",
            cover_image: "/BG1.png",
            description: "Always-on creator campaign focused on diversity and real results.",
            results: "12M Views",
            reach: "5.4M",
            engagement: "8.2%",
            feedback: "Outstanding engagement and audience response.",
            published: 1,
            sort_order: 1,
          },
          {
            id: crypto.randomUUID(),
            title: "THE NORTH FACE: Never Stop",
            client: "The North Face",
            category: "Brand Strategy",
            cover_image: "/BG.jpg",
            description: "A feed-first content engine launching their new outerwear series.",
            results: "4.8M Impressions",
            reach: "2.1M",
            engagement: "6.5%",
            feedback: "Exceeded all product discovery KPIs.",
            published: 1,
            sort_order: 2,
          },
          {
            id: crypto.randomUUID(),
            title: "Spotify: Wrapped 2024",
            client: "Spotify",
            category: "Launches & Drops",
            cover_image: "/BG1.png",
            description: "Creating social-first cultural moments around end-of-year listener insights.",
            results: "15M Shares",
            reach: "10M",
            engagement: "11.4%",
            feedback: "Culturally relevant launch that dominated conversations.",
            published: 1,
            sort_order: 3,
          },
        ];

        for (const c of seedCampaigns) {
          await db.execute({
            sql: `INSERT INTO campaigns 
              (id, title, client, category, cover_image, description, results, reach, engagement, feedback, gallery, published, sort_order) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              c.id,
              c.title,
              c.client,
              c.category,
              c.cover_image,
              c.description,
              c.results,
              c.reach,
              c.engagement,
              c.feedback,
              "[]",
              c.published,
              c.sort_order,
            ],
          });
        }
      }

      // Check team members
      const teamRes = await db.execute("SELECT count(*) as count FROM team_members");
      if (Number(teamRes.rows[0].count) === 0) {
        console.log("[SQLite] Seeding team members...");
        const seedTeam = [
          {
            id: crypto.randomUUID(),
            name: "Maya Sen",
            role: "Founder & Creative Director",
            bio: "Ex-agency disruptor building the brands of the future.",
            image: "",
            socials: '{"instagram":"#","twitter":"#"}',
            sort_order: 1,
            published: 1,
          },
          {
            id: crypto.randomUUID(),
            name: "Arjun Mehta",
            role: "Head of Strategy",
            bio: "Gen-Z culture obsessed quantitative planner.",
            image: "",
            socials: '{"instagram":"#","twitter":"#"}',
            sort_order: 2,
            published: 1,
          },
          {
            id: crypto.randomUUID(),
            name: "Zara Patel",
            role: "Director of Creator Partnerships",
            bio: "Representing the creators shaping the next decade.",
            image: "",
            socials: '{"instagram":"#","twitter":"#"}',
            sort_order: 3,
            published: 1,
          },
        ];

        for (const t of seedTeam) {
          await db.execute({
            sql: "INSERT INTO team_members (id, name, role, bio, image, socials, sort_order, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            args: [t.id, t.name, t.role, t.bio, t.image, t.socials, t.sort_order, t.published],
          });
        }
      }

      // Check testimonials
      const testimonialsRes = await db.execute("SELECT count(*) as count FROM testimonials");
      if (Number(testimonialsRes.rows[0].count) === 0) {
        console.log("[SQLite] Seeding testimonials...");
        const seedTestimonials = [
          {
            id: crypto.randomUUID(),
            author: "Sarah Jenkins",
            role: "Director of Growth, Fenty Beauty",
            quote: "Social Cloutt doesn't just hit the numbers; they shape the conversation. Highly recommend.",
            avatar: "",
            sort_order: 1,
            published: 1,
          },
          {
            id: crypto.randomUUID(),
            author: "Marcus Wong",
            role: "VP Marketing, Spotify",
            quote: "They run social like a media company, not an agency. Outstanding execution.",
            avatar: "",
            sort_order: 2,
            published: 1,
          },
        ];

        for (const t of seedTestimonials) {
          await db.execute({
            sql: "INSERT INTO testimonials (id, author, role, quote, avatar, sort_order, published) VALUES (?, ?, ?, ?, ?, ?, ?)",
            args: [t.id, t.author, t.role, t.quote, t.avatar, t.sort_order, t.published],
          });
        }
      }
    } catch (e) {
      console.error("[SQLite] Error initializing database:", e);
      throw e;
    }
  })();

  return initPromise;
}
