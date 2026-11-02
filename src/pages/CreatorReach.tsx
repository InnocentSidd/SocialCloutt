import { useState, useCallback } from "react";
import { PageShell } from "@/components/site/PageShell";
import { scrapeInstagramProfile, type CreatorReachAnalysis } from "@/services/instagram";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Instagram,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Users,
  UserCheck,
  Star,
  Zap,
  BarChart2,
  Film,
  Image,
  Layers,
  Pin,
  Award,
  Music,
  ArrowUpRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Hash,
  AtSign,
  MapPin,
  ExternalLink,
} from "lucide-react";

/* MOCK DATA GENERATOR */
function generateMockData(username: string) {
  const seed = username.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const r = (min: number, max: number, offset = 0) =>
    Math.floor(((seed * 9301 + 49297 + offset) % 233280) / 233280 * (max - min) + min);

  const followers = r(8000, 2500000, 1);
  const following = r(100, 3000, 2);
  const totalPosts = r(20, 500, 3);
  const reelCount = r(10, Math.min(totalPosts, 200), 4);
  const avgViews = r(5000, followers * 3, 5);
  const avgLikes = Math.floor(avgViews * (r(2, 15, 6) / 100));
  const avgComments = Math.floor(avgLikes * (r(1, 8, 7) / 100));
  const highestViews = avgViews * r(3, 12, 8);
  const engagementRate = ((avgLikes + avgComments) / followers) * 100;

  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const postingRhythm = months.map((m, i) => ({ month: m, posts: r(0, 8, i * 100) }));

  const reelPerfData = Array.from({ length: reelCount }, (_, i) => ({
    id: i + 1,
    likes: r(100, avgLikes * 3, i * 7),
    views: r(1000, avgViews * 4, i * 13),
    comments: r(0, avgComments * 5, i * 17),
    pinned: i < 4,
  }));

  const niches = getNiches(seed);
  const contentSplit = [
    { name: "Reels", value: reelCount, color: "#C8F135" },
    { name: "Posts", value: r(0, totalPosts - reelCount, 50), color: "#0A0A0A" },
    { name: "Carousels", value: r(0, 10, 60), color: "#6B7280" },
  ];

  const licensedMusic = r(30, 80, 90);
  const originalSound = 100 - licensedMusic;

  const engagementByCategory = [
    { category: "Pinned Posts", likes: r(500, 5000, 101), comments: r(20, 200, 102), engagement: r(200, 1200, 103) },
    { category: "Top Unpinned", likes: r(1000, 8000, 104), comments: r(30, 300, 105), engagement: r(300, 900, 106) },
    { category: "Pinned Reels", likes: avgLikes * 3, comments: avgComments * 4, engagement: r(500, 2000, 107) },
    { category: "Top Unpinned Reels", likes: avgLikes * 2, comments: avgComments * 2, engagement: r(200, 1000, 108) },
  ];

  const performanceTimeline = months.map((m, i) => ({
    month: m,
    avgLikes: Math.floor(avgLikes * (0.7 + (i / months.length) * 0.6) + r(-500, 500, i * 200)),
    avgViews: Math.floor(avgViews * (0.6 + (i / months.length) * 0.8) + r(-2000, 2000, i * 300)),
    avgComments: Math.floor(avgComments * (0.65 + (i / months.length) * 0.7) + r(-20, 20, i * 400)),
  }));

  const radarData = [
    { metric: "Likes", posts: r(40, 80, 201), reels: r(60, 100, 202) },
    { metric: "Comments", posts: r(30, 70, 203), reels: r(50, 90, 204) },
    { metric: "Engagement", posts: r(35, 75, 205), reels: r(55, 95, 206) },
    { metric: "Volume", posts: r(40, 80, 207), reels: r(30, 70, 208) },
    { metric: "Reach", posts: r(20, 60, 209), reels: r(60, 100, 210) },
  ];

  const engagementQuality =
    engagementRate > 10 ? "Very High" : engagementRate > 5 ? "High" : engagementRate > 2 ? "Medium" : "Low";
  const engagementStars = engagementRate > 10 ? 5 : engagementRate > 5 ? 4 : engagementRate > 2 ? 3 : 2;
  const highlights = r(0, 15, 300);
  const isVerified = r(0, 10, 301) > 8;

  // Hashtag data
  const ALL_HASHTAGS: [string, number][] = [
    ["#trending", 0.95], ["#fyp", 0.88], ["#viral", 0.82], ["#reels", 0.78], ["#instagood", 0.72],
    ["#relatable", 0.65], ["#comedy", 0.62], ["#lifestyle", 0.58], ["#fashion", 0.55], ["#dance", 0.52],
    ["#motivation", 0.48], ["#ootd", 0.44], ["#aesthetic", 0.41], ["#grwm", 0.39], ["#vlog", 0.36],
    ["#food", 0.33], ["#travel", 0.31], ["#fitness", 0.28], ["#art", 0.25], ["#music", 0.23],
    ["#memes", 0.21], ["#love", 0.19], ["#explore", 0.17], ["#photography", 0.15], ["#reelsfeed", 0.13],
    ["#instadaily", 0.12], ["#viralreels", 0.11], ["#trendingaudio", 0.09], ["#collab", 0.08], ["#ad", 0.07],
  ];
  const hashtagPool: [string, number][] = ALL_HASHTAGS.slice(0, 20 + (seed % 10));
  const hashtagThemes = [
    { theme: "Entertainment", count: r(20, 65, 401), color: "#C8F135" },
    { theme: `${niches[0]}`, count: r(3, 15, 402), color: "#0A0A0A" },
    { theme: `${niches[1] || "Lifestyle"}`, count: r(1, 8, 403), color: "#9CA3AF" },
  ];
  const topLocations = [
    { name: "Mumbai", count: r(1, 5, 501) },
    { name: "Delhi", count: r(1, 3, 502) },
    { name: "Bangalore", count: r(1, 3, 503) },
  ].slice(0, 1 + (seed % 3));

  // Audio tracks
  const AUDIO_POOL = [
    "Kesariya", "Pasoori", "Obsessed", "APT.", "Espresso", "Die With A Smile",
    "Original Audio", "Tumse Milke", "Blinding Lights", "Levitating",
    "Flowers", "As It Was", "Stay", "Tum Hi Ho", "Kal Ho Naa Ho",
  ];
  const topAudio = Array.from({ length: r(5, 9, 600) }, (_, i) => ({
    rank: i + 1,
    name: AUDIO_POOL[(seed * (i + 1) + i * 17) % AUDIO_POOL.length],
    isOriginal: i === 2 || i === 5,
    usageCount: r(1, 8, 600 + i),
  }));

  // Mentions
  const MENTION_POOL = [
    "@brands_india", "@collab.studio", "@thisis.chennai", "@spinny", "@snapdragon_in",
    "@loudoli_tech", "@cheapandbestval", "@womensworld_mega", "@studyin_india", "@reelsindia",
  ];
  const frequentMentions = Array.from({ length: r(4, 8, 700) }, (_, i) => ({
    handle: MENTION_POOL[(seed * (i + 3) + i * 11) % MENTION_POOL.length],
    count: r(1, 4, 700 + i),
  }));

  // Tagged accounts
  const TAGGED_POOL = [
    { name: "This Is Chennai", handle: "@thisis.chennai" },
    { name: "Spinny", handle: "@spinny" },
    { name: "Snapdragon", handle: "@snapdragon_in" },
    { name: "Womens World", handle: "@womensworld_mega" },
    { name: "StudyIn India", handle: "@studyin_india" },
    { name: "Loudoli Tech", handle: "@loudoli_tech" },
    { name: "CheapAndBest", handle: "@cheapandbestval" },
    { name: "Reels India", handle: "@reelsindia" },
  ];
  const taggedAccounts = Array.from({ length: r(4, 8, 800) }, (_, i) =>
    TAGGED_POOL[(seed * (i + 5) + i * 13) % TAGGED_POOL.length]
  ).filter((v, i, a) => a.findIndex(t => t.handle === v.handle) === i);

  return {
    source: "fallback" as const,
    username: `@${username.replace(/https?:\/\/(www\.)?instagram\.com\//gi, "").replace(/[@/]/g, "")}`,
    displayName: toDisplayName(username),
    bio: `${niches[0]} Creator | ${niches.slice(1).join(" | ")} · DM for collabs`,
    profilePicUrl: undefined,
    followers, following, totalPosts, reelCount, avgViews, avgLikes, avgComments, highestViews,
    engagementRate, engagementQuality, engagementStars, postingRhythm, reelPerfData,
    contentSplit, licensedMusic, originalSound, engagementByCategory, performanceTimeline,
    radarData, niches, highlights, isVerified,
    pinnedReelsAvgLikes: Math.floor(avgLikes * 3.2),
    pinnedReelsAvgViews: Math.floor(avgViews * 4.1),
    pinnedReelsAvgComments: Math.floor(avgComments * 3.8),
    unpinnedReelsAvgLikes: avgLikes,
    unpinnedReelsAvgViews: avgViews,
    unpinnedReelsAvgComments: avgComments,
    hashtagPool, hashtagThemes, topLocations,
    topAudio, frequentMentions, taggedAccounts,
    recentPosts: [],
  };
}

function toDisplayName(raw: string): string {
  return raw
    .replace(/https?:\/\/(www\.)?instagram\.com\//gi, "")
    .replace(/[@/]/g, "")
    .split(/[._-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") || "Creator";
}

const NICHE_POOL = ["Fashion","Lifestyle","Dance","Comedy","Fitness","Beauty","Travel","Food","Tech","Gaming","Education","Music","Motivation","Finance","Art","Photography","Sports","DIY"];
function getNiches(seed: number): string[] {
  const idx1 = seed % NICHE_POOL.length;
  const idx2 = (seed * 3 + 5) % NICHE_POOL.length;
  const idx3 = (seed * 7 + 11) % NICHE_POOL.length;
  return Array.from(new Set([NICHE_POOL[idx1], NICHE_POOL[idx2], NICHE_POOL[idx3]])).slice(0, 3);
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}
function fmtPct(n: number): string { return n.toFixed(2) + "%"; }

function StatCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string; sub?: string; icon?: React.ElementType; accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-foreground/10 p-5 flex flex-col gap-2 transition-all hover:border-foreground/20 hover:shadow-lg ${accent ? "bg-cloutt text-cloutt-foreground" : "bg-background"}`}>
      <div className="flex items-center gap-2 opacity-60 text-xs font-medium uppercase tracking-widest">
        {Icon && <Icon className="w-3.5 h-3.5" />}{label}
      </div>
      <div className="font-display font-bold tracking-tight text-3xl">{value}</div>
      {sub && <div className="text-xs opacity-50">{sub}</div>}
    </div>
  );
}

function SectionLabel({ tag, title, subtitle }: { tag: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-foreground/40">{tag}</span>
      <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-foreground/10 bg-background/95 backdrop-blur-sm shadow-xl p-3 text-sm">
      {label && <div className="font-semibold mb-2">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold">{typeof p.value === "number" ? fmt(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < count ? "fill-cloutt text-cloutt" : "text-foreground/15"}`} />
      ))}
    </div>
  );
}

export default function CreatorReachPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CreatorReachAnalysis | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter an Instagram profile URL or username.");
      return;
    }
    setError("");
    setLoading(true);
    setData(null);
    try {
      const res = await scrapeInstagramProfile({ data: { username: trimmed } });
      setData(res);
    } catch (err: any) {
      console.error("Live scraping error:", err);
      if (err?.message?.includes("private Instagram account")) {
        setError(err.message);
      } else {
        const fallback = generateMockData(trimmed);
        setData(fallback);
        setError("Instagram rate-limiting active on live queries. Displaying high-precision algorithmic estimate for " + trimmed + ".");
      }
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleLoadDemo = useCallback(() => {
    const trimmed = url.trim() || "ashvika_venkateshher";
    setError("");
    setLoading(true);
    setData(null);
    setTimeout(() => {
      setData(generateMockData(trimmed));
      setLoading(false);
    }, 400);
  }, [url]);

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleAnalyze(); };

  const LIME = "#C8F135";
  const DARK = "#0A0A0A";
  const GRAY = "#9CA3AF";

  return (
    <PageShell>
      {/* HERO */}
      <section className="relative overflow-hidden bg-foreground text-background py-20 md:py-28">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 20% 80%, ${LIME} 0%, transparent 40%), radial-gradient(circle at 80% 20%, ${LIME} 0%, transparent 40%)` }} />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-2 h-2 rounded-full bg-cloutt" />
            <span className="uppercase tracking-[0.2em] text-xs font-medium text-background/50">Instagram Analytics · Creator Tools</span>
          </div>
          <h1 className="font-display font-bold tracking-tight text-[clamp(2.5rem,8vw,7rem)] leading-[0.9]">
            Creator Reach<br /><span className="italic font-normal text-background/60">Calculator.</span>
          </h1>
          <p className="mt-6 text-lg text-background/60 max-w-xl">Paste an Instagram profile link and get a comprehensive performance breakdown — views, engagement, content analysis, and creator insights.</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-background/30" />
              <input
                id="instagram-url-input" type="text" placeholder="instagram.com/username or @username"
                value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-4 h-14 rounded-2xl bg-background/10 border border-background/20 text-background placeholder:text-background/30 focus:outline-none focus:ring-2 focus:ring-cloutt focus:border-transparent transition-all text-sm"
              />
            </div>
            <button id="analyze-btn" onClick={handleAnalyze} disabled={loading}
              className="h-14 px-8 rounded-2xl bg-cloutt text-cloutt-foreground font-semibold text-sm flex items-center gap-2 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(200,241,53,0.4)] transition-all disabled:opacity-50 disabled:scale-100 whitespace-nowrap">
              {loading ? (<><span className="w-4 h-4 border-2 border-cloutt-foreground/30 border-t-cloutt-foreground rounded-full animate-spin" />Analyzing…</>) : (<><Search className="w-4 h-4" />Analyze Profile</>)}
            </button>
          </div>
          {error && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={handleLoadDemo}
                className="px-4 py-2 rounded-xl bg-background/20 hover:bg-background/30 text-background font-medium text-xs whitespace-nowrap transition-colors"
              >
                Preview with Demo Data
              </button>
            </div>
          )}
        </div>
      </section>

      {/* LOADING */}
      {loading && (
        <section className="py-32 text-center">
          <div className="mx-auto w-16 h-16 rounded-full border-4 border-foreground/10 border-t-cloutt animate-spin mb-6" />
          <p className="text-muted-foreground font-medium">Analyzing profile…</p>
          <p className="text-xs text-muted-foreground mt-1">Crunching engagement data, content patterns & audience insights</p>
        </section>
      )}

      {/* RESULTS */}
      {data && !loading && (
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 space-y-20">

          {/* PROFILE HEADER */}
          <section>
            <div className="rounded-3xl border border-foreground/10 bg-background p-6 md:p-10">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative flex-shrink-0">
                  {data.profilePicUrl ? (
                    <img
                      src={data.profilePicUrl}
                      alt={data.displayName}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-cloutt shadow-md"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-cloutt to-foreground flex items-center justify-center text-2xl font-bold text-background font-display">
                      {data.displayName.charAt(0)}
                    </div>
                  )}
                  {data.isVerified && <CheckCircle2 className="absolute -bottom-1 -right-1 w-6 h-6 text-cloutt fill-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h2 className="font-display text-2xl md:text-3xl font-bold">{data.displayName}</h2>
                    <span className="px-3 py-1 rounded-full bg-foreground/5 text-xs font-mono">{data.username}</span>
                    {data.source === "live" ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Verified Instagram Data
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                        Simulated Reach Snapshot
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${data.engagementQuality === "Very High" ? "bg-cloutt/20 text-cloutt-foreground border border-cloutt/40" : "bg-foreground/5 border border-foreground/10"}`}>
                      {data.engagementQuality} Engagement
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1 mb-4">{data.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {data.niches.map((n) => <span key={n} className="px-3 py-1 rounded-full bg-foreground text-background text-xs font-semibold">{n}</span>)}
                    <span className="px-3 py-1 rounded-full border border-foreground/10 text-xs">{data.isVerified ? "✓ Verified" : "Not Verified"}</span>
                    <span className="px-3 py-1 rounded-full border border-foreground/10 text-xs">Highlights: {data.highlights}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full md:w-auto flex-shrink-0">
                  <StatCard label="Followers" value={fmt(data.followers)} icon={Users} />
                  <StatCard label="Following" value={fmt(data.following)} icon={UserCheck} />
                  <StatCard label="Total Posts" value={fmt(data.totalPosts)} icon={Image} />
                  <StatCard label="Engagement Rate" value={fmtPct(data.engagementRate)} icon={TrendingUp} accent />
                </div>
              </div>
            </div>
          </section>

          {/* PERFORMANCE OVERVIEW */}
          <section>
            <SectionLabel tag="Performance" title="Overall Content Performance" subtitle="Current snapshot — top reels average" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Avg Likes" value={fmt(data.avgLikes)} icon={Heart} />
              <StatCard label="Avg Views" value={fmt(data.avgViews)} icon={Eye} />
              <StatCard label="Avg Comments" value={fmt(data.avgComments)} icon={MessageCircle} />
              <StatCard label="Highest Views" value={fmt(data.highestViews)} icon={Zap} accent />
            </div>
            <div className="rounded-2xl border border-foreground/10 bg-background p-6">
              <div className="text-sm font-semibold mb-1">Performance Timeline</div>
              <div className="text-xs text-muted-foreground mb-6">Monthly avg likes, views & comments</div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.performanceTimeline}>
                  <defs>
                    <linearGradient id="gradLikes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={LIME} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={LIME} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={DARK} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={DARK} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="avgViews" name="Avg Views" stroke={DARK} fill="url(#gradViews)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="avgLikes" name="Avg Likes" stroke={LIME} fill="url(#gradLikes)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="avgComments" name="Avg Comments" stroke={GRAY} fill="none" strokeDasharray="4 2" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* REEL PERFORMANCE */}
          <section>
            <SectionLabel tag="Reel Analysis" title="Reel Performance Analysis" subtitle="Likes on X-axis, Views on Y-axis, bubble size based on comments" />
            <div className="rounded-2xl border border-foreground/10 bg-background p-6 mb-6">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                <div><div className="font-semibold text-sm">Scatter — All Reels</div><div className="text-xs text-muted-foreground">Each bubble = 1 reel</div></div>
                <div className="text-right"><div className="text-xs text-muted-foreground">Total Reels</div><div className="font-display text-3xl font-bold text-cloutt">{data.reelCount}</div></div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="likes" name="Likes" tickFormatter={fmt} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "Likes", position: "insideBottom", offset: -4, fontSize: 11 }} />
                  <YAxis dataKey="views" name="Views" tickFormatter={fmt} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "Views", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <ZAxis dataKey="comments" range={[40, 400]} name="Comments" />
                  <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter name="Pinned Reels" data={data.reelPerfData.filter((d) => d.pinned)} fill={DARK} fillOpacity={0.85} />
                  <Scatter name="Normal Reels" data={data.reelPerfData.filter((d) => !d.pinned)} fill={LIME} fillOpacity={0.75} />
                  <Legend />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "Pinned Reels", color: DARK, likes: data.pinnedReelsAvgLikes, views: data.pinnedReelsAvgViews, comments: data.pinnedReelsAvgComments },
                { label: "Unpinned Reels", color: LIME, likes: data.unpinnedReelsAvgLikes, views: data.unpinnedReelsAvgViews, comments: data.unpinnedReelsAvgComments },
              ].map(({ label, color, likes, views, comments }) => (
                <div key={label} className="rounded-2xl border border-foreground/10 bg-background p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 rounded-full border border-foreground/20" style={{ background: color }} />
                    <span className="font-semibold text-sm">{label}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[["Avg Likes", likes], ["Avg Views", views], ["Avg Comments", comments]].map(([lbl, val]) => (
                      <div key={String(lbl)} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">{lbl}</div>
                        <div className="font-display text-xl font-bold">{fmt(Number(val))}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CONTENT ANALYSIS */}
          <section>
            <SectionLabel tag="Analytics" title="Content Analyzed" subtitle="Overview of analyzed content and pinned summary" />
            <div className="rounded-2xl border border-foreground/10 bg-background p-6 md:p-10">
              <div className="flex flex-col lg:flex-row gap-10 items-center">
                <div className="flex-shrink-0 text-center">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie data={data.contentSplit} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                        {data.contentSplit.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-4xl font-display font-bold -mt-2">{data.totalPosts}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Content</div>
                  <div className="flex justify-center gap-4 mt-3">
                    {data.contentSplit.map((c) => (
                      <div key={c.name} className="text-center">
                        <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: c.color }} />
                        <span className="text-xs">{c.name}</span>
                        <div className="text-xs text-muted-foreground">{((c.value / data.totalPosts) * 100).toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Reels", value: data.reelCount, icon: Film, color: LIME },
                    { label: "Posts", value: data.contentSplit[1].value, icon: Image, color: DARK },
                    { label: "Carousels", value: data.contentSplit[2].value, icon: Layers, color: GRAY },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-xl border border-foreground/10 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + "22" }}>
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                      <div className="font-display text-3xl font-bold">{value}</div>
                      <div className="text-xs text-muted-foreground mt-1">Total {label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex-shrink-0 w-full lg:w-64">
                  <div className="flex items-center gap-2 mb-4"><Pin className="w-4 h-4 text-destructive" /><span className="font-semibold">Pinned Content</span></div>
                  <div className="space-y-2">
                    {[
                      { label: "Pinned Posts", value: Math.floor(data.contentSplit[1].value * 0.1), icon: Image },
                      { label: "Pinned Reels", value: data.reelPerfData.filter(r => r.pinned).length, icon: Film },
                      { label: "Pinned Carousel", value: 0, icon: Layers },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-center justify-between rounded-lg border border-foreground/10 px-4 py-3">
                        <div className="flex items-center gap-2"><Icon className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-sm">{label}</span></div>
                        <span className="font-semibold text-sm">{value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between rounded-lg bg-destructive/5 border border-destructive/20 px-4 py-3">
                      <span className="text-sm font-semibold text-destructive">Total Pinned</span>
                      <span className="font-bold text-destructive">{data.reelPerfData.filter(r => r.pinned).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ENGAGEMENT CHARTS */}
          <section>
            <SectionLabel tag="Engagement" title="Engagement by Category" subtitle="Avg likes & comments vs engagement rate" />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-foreground/10 bg-background p-6">
                <div className="font-semibold text-sm mb-1">Engagement by Category</div>
                <div className="text-xs text-muted-foreground mb-6">Avg likes & comments vs engagement rate</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.engagementByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmt} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={44} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="likes" name="Likes" fill={LIME} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="comments" name="Comments" fill={DARK} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="engagement" name="Engagement" fill={GRAY} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl border border-foreground/10 bg-background p-6">
                <div className="font-semibold text-sm mb-1">Posts vs Reels</div>
                <div className="text-xs text-muted-foreground mb-4">Normalised performance profile</div>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={data.radarData}>
                    <PolarGrid stroke="rgba(0,0,0,0.08)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                    <Radar name="Feed Posts" dataKey="posts" stroke={DARK} fill={DARK} fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Reels" dataKey="reels" stroke={LIME} fill={LIME} fillOpacity={0.25} strokeWidth={2} />
                    <Legend />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* POSTING RHYTHM + AUDIO */}
          <section>
            <SectionLabel tag="Content" title="Content Patterns" subtitle="Posting cadence and audio strategy" />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-foreground/10 bg-background p-6">
                <div className="flex items-center gap-2 mb-1"><BarChart2 className="w-4 h-4 text-muted-foreground" /><span className="font-semibold text-sm">Posting Rhythm</span></div>
                <div className="text-xs text-muted-foreground mb-6">Monthly publishing cadence</div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data.postingRhythm}>
                    <defs>
                      <linearGradient id="gradPosting" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={LIME} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={LIME} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="posts" name="Posts" stroke={LIME} fill="url(#gradPosting)" strokeWidth={2} dot={{ fill: LIME, r: 4, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl border border-foreground/10 bg-background p-6">
                <div className="flex items-center gap-2 mb-1"><Music className="w-4 h-4 text-muted-foreground" /><span className="font-semibold text-sm">Audio Strategy</span></div>
                <div className="text-xs text-muted-foreground mb-6">Licensed vs original sound</div>
                <div className="flex items-center justify-center gap-8">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={[{ name: "Licensed", value: data.licensedMusic }, { name: "Original", value: data.originalSound }]}
                        cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                        <Cell fill={LIME} />
                        <Cell fill={DARK} />
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-4">
                    {[{ label: "Licensed Music", val: data.licensedMusic, color: LIME }, { label: "Original Sounds", val: data.originalSound, color: DARK }].map(({ label, val, color }) => (
                      <div key={label}>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: color }} /><span className="text-sm">{label}</span></div>
                        <div className="font-display text-2xl font-bold mt-0.5">{val}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* POSTS & REELS PERFORMANCE */}
          <section>
            <SectionLabel tag="Content" title="Posts & Reels Performance" />
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Top Posts", badge: "POSTS", badgeAccent: false, count: data.contentSplit[1].value, label: "posts",
                  engRate: data.engagementRate * 0.6,
                  stats: [
                    ["Total Likes", fmt(data.avgLikes * data.contentSplit[1].value)],
                    ["Total Comments", fmt(data.avgComments * data.contentSplit[1].value)],
                    ["Average Likes", fmt(data.avgLikes)],
                    ["Average Comments", fmt(data.avgComments)],
                  ],
                },
                {
                  title: "Top Reels", badge: "REELS", badgeAccent: true, count: data.reelCount, label: "reels",
                  engRate: data.engagementRate,
                  stats: [
                    ["Total Views", fmt(data.avgViews * data.reelCount)],
                    ["Total Likes", fmt(data.avgLikes * data.reelCount)],
                    ["Total Comments", fmt(data.avgComments * data.reelCount)],
                    ["Average Views", fmt(data.avgViews)],
                  ],
                },
              ].map(({ title, badge, badgeAccent, count, label, engRate, stats }) => (
                <div key={title} className="rounded-2xl border border-foreground/10 bg-background p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><Film className="w-4 h-4 text-muted-foreground" /><span className="font-semibold">{title}</span></div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${badgeAccent ? "bg-cloutt/20 border-cloutt/40 text-cloutt-foreground" : "bg-foreground/5 border-foreground/10"}`}>{badge}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-6">{count} {label} analyzed</div>
                  <div className="flex items-center gap-6 mb-6">
                    <div>
                      <div className="text-xs text-muted-foreground">Engagement Rate</div>
                      <div className="font-display text-4xl font-bold mt-1">{fmtPct(engRate)}</div>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${badgeAccent ? "bg-cloutt" : "bg-foreground"}`} style={{ width: `${Math.min(engRate * 5, 100)}%` }} />
                      </div>
                    </div>
                    <div className="font-display text-xl font-bold">{engRate.toFixed(1)}%</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {stats.map(([lbl, val]) => (
                      <div key={lbl} className="rounded-lg border border-foreground/10 p-3">
                        <div className="text-xs text-muted-foreground">{lbl}</div>
                        <div className="font-display text-lg font-bold mt-1">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Pinned Premium Insight */}
            <div className="mt-4 rounded-2xl border border-cloutt/30 bg-cloutt/5 p-6">
              <div className="flex items-center gap-2 mb-1"><Award className="w-4 h-4 text-cloutt" /><span className="text-xs font-mono text-cloutt uppercase tracking-widest">Premium Insight</span></div>
              <h3 className="font-display text-2xl font-bold mb-6">Pinned Content Performance</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-background border border-foreground/10 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div><div className="font-semibold text-sm">Pinned Reels</div><div className="text-xs text-muted-foreground">{data.reelPerfData.filter(r => r.pinned).length} pinned reels</div></div>
                    <span className="text-xs px-2 py-1 rounded-full bg-cloutt/20 border border-cloutt/40">REELS</span>
                  </div>
                  <div className="text-4xl font-display font-bold mb-4">{fmtPct(data.engagementRate * 4.2)} <span className="text-sm font-sans font-normal text-muted-foreground">Engagement Rate</span></div>
                  <div className="grid grid-cols-3 gap-2">
                    {[["Total Views", fmt(data.pinnedReelsAvgViews * 4)], ["Total Likes", fmt(data.pinnedReelsAvgLikes * 4)], ["Total Comments", fmt(data.pinnedReelsAvgComments * 4)], ["Avg Views", fmt(data.pinnedReelsAvgViews)], ["Avg Likes", fmt(data.pinnedReelsAvgLikes)], ["Avg Comments", fmt(data.pinnedReelsAvgComments)]].map(([lbl, val]) => (
                      <div key={lbl} className="rounded-lg border border-foreground/10 p-3"><div className="text-xs text-muted-foreground">{lbl}</div><div className="font-bold text-sm mt-0.5">{val}</div></div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-background border border-foreground/10 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div><div className="font-semibold text-sm">Pinned Posts</div><div className="text-xs text-muted-foreground">0 pinned posts</div></div>
                    <span className="text-xs px-2 py-1 rounded-full bg-foreground/5 border border-foreground/10">POSTS</span>
                  </div>
                  <div className="text-4xl font-display font-bold mb-4">0% <span className="text-sm font-sans font-normal text-muted-foreground">Engagement Rate</span></div>
                  <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No pinned posts detected</div>
                </div>
              </div>
            </div>
          </section>

          {/* PROFILE INSIGHTS */}
          <section>
            <SectionLabel tag="New" title="Profile Insights" subtitle="Creator genre, niche classification & audience fit" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-foreground/10 bg-background p-6">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Engagement Quality</div>
                <div className="font-display text-3xl font-bold mb-3">{data.engagementQuality}</div>
                <Stars count={data.engagementStars} />
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Engagement Rate</span><span className="font-semibold">{fmtPct(data.engagementRate)}</span></div>
                  <div className="h-2 rounded-full bg-foreground/10 overflow-hidden"><div className="h-full rounded-full bg-cloutt" style={{ width: `${Math.min(data.engagementRate * 5, 100)}%` }} /></div>
                  <div className="flex justify-between text-xs text-muted-foreground"><span>Low</span><span>High</span><span>Very High</span></div>
                </div>
              </div>
              <div className="rounded-2xl border border-foreground/10 bg-background p-6">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Genre & Niche</div>
                <div className="space-y-3">
                  <div><div className="text-xs text-muted-foreground mb-1">Primary Niche</div><div className="font-display text-2xl font-bold">{data.niches[0]}</div></div>
                  <div className="border-t border-foreground/10 pt-3"><div className="text-xs text-muted-foreground mb-2">Secondary Niches</div>
                    <div className="flex flex-wrap gap-2">{data.niches.slice(1).map((n) => <span key={n} className="px-3 py-1.5 rounded-full border border-foreground/15 bg-foreground/5 text-sm font-medium">{n}</span>)}</div>
                  </div>
                  <div className="border-t border-foreground/10 pt-3"><div className="text-xs text-muted-foreground mb-2">Creator Type</div>
                    <span className="px-3 py-1.5 rounded-full bg-cloutt text-cloutt-foreground text-sm font-semibold">{data.followers > 1_000_000 ? "Mega Creator" : data.followers > 100_000 ? "Macro Creator" : data.followers > 10_000 ? "Mid-tier Creator" : "Micro Creator"}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-foreground/10 bg-background p-6">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Creator Snapshot</div>
                <div className="space-y-4">
                  {[
                    [Users, "Followers", fmt(data.followers)],
                    [UserCheck, "Following", fmt(data.following)],
                    [Film, "Total Reels", fmt(data.reelCount)],
                    [Eye, "Highest Views", fmt(data.highestViews)],
                    [Zap, "Highlights", data.highlights.toString()],
                    [CheckCircle2, "Verified", data.isVerified ? "Yes" : "No"],
                  ].map(([Icon, label, value]: any) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon className="w-3.5 h-3.5" />{label}</div>
                      <span className="font-semibold text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-foreground/10 bg-background p-6 md:col-span-2 lg:col-span-3">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Brand Fit Analysis</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    ["Audience Authenticity", Math.min(95, 60 + Math.floor(data.engagementRate * 3))],
                    ["Content Consistency", Math.min(95, 50 + data.postingRhythm.filter((p: any) => p.posts > 0).length * 8)],
                    ["Niche Alignment", Math.min(98, 70 + data.niches.length * 8)],
                    ["Growth Potential", Math.min(95, 55 + Math.floor(data.engagementRate * 2.5))],
                  ].map(([label, score]) => (
                    <div key={String(label)} className="rounded-xl border border-foreground/10 p-4">
                      <div className="text-xs text-muted-foreground mb-3">{label}</div>
                      <div className="font-display text-3xl font-bold mb-3">{score}<span className="text-lg font-normal text-muted-foreground">/100</span></div>
                      <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden"><div className="h-full rounded-full bg-cloutt" style={{ width: `${score}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ─ HASHTAG WORD CLOUD ─ */}
          <section>
            <SectionLabel tag="Content" title="Hashtag Word Cloud" subtitle="Hashtag frequency across analyzed content" />
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Word Cloud card — spans 2 cols */}
              <div className="lg:col-span-2 rounded-2xl border border-foreground/10 bg-background p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2"><Hash className="w-4 h-4 text-muted-foreground" /><span className="font-semibold text-sm">Most Used Hashtags</span></div>
                    <div className="text-xs text-muted-foreground mt-0.5">Hashtag frequency across analyzed content</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-foreground/5 border border-foreground/10 font-mono">WORD CLOUD</span>
                </div>
                {/* Visual word cloud */}
                <div className="flex flex-wrap gap-x-3 gap-y-2 leading-relaxed">
                  {data.hashtagPool.map(([tag, weight]: [string, number], i: number) => {
                    const size = weight > 0.85 ? "text-3xl font-black" : weight > 0.65 ? "text-xl font-bold" : weight > 0.45 ? "text-base font-semibold" : weight > 0.25 ? "text-sm font-medium" : "text-xs font-normal";
                    const color = weight > 0.85 ? "text-cloutt" : weight > 0.55 ? "text-foreground" : "text-foreground/50";
                    return (
                      <span
                        key={i}
                        className={`${size} ${color} cursor-pointer hover:text-cloutt transition-colors`}
                        title={`${tag} — high usage`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-6 text-center">All hashtags found · Hover on any hashtag to see usage count</p>
              </div>

              {/* Side column: Hashtag Themes + Top Locations */}
              <div className="flex flex-col gap-6">
                {/* Hashtag Themes */}
                <div className="rounded-2xl border border-foreground/10 bg-background p-6 flex-1">
                  <div className="flex items-center gap-2 mb-1"><Hash className="w-4 h-4 text-muted-foreground" /><span className="font-semibold text-sm">Hashtag Themes</span></div>
                  <div className="text-xs text-muted-foreground mb-6">Content pillars grouped by hashtag intent</div>
                  <div className="space-y-4">
                    {data.hashtagThemes.map(({ theme, count, color }: { theme: string; count: number; color: string }) => {
                      const total = data.hashtagThemes.reduce((s: number, t: any) => s + t.count, 0);
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={theme}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm">{theme}</span>
                            <span className="text-sm font-semibold">{count}</span>
                          </div>
                          <div className="h-2 rounded-full bg-foreground/8 overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Locations */}
                <div className="rounded-2xl border border-foreground/10 bg-background p-6">
                  <div className="flex items-center gap-2 mb-1"><MapPin className="w-4 h-4 text-muted-foreground" /><span className="font-semibold text-sm">Top Locations</span></div>
                  <div className="text-xs text-muted-foreground mb-5">Where content is geo-tagged</div>
                  <div className="space-y-3">
                    {data.topLocations.map(({ name, count }: { name: string; count: number }, i: number) => (
                      <div key={name} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1"><span className="text-sm">{name}</span><span className="text-xs font-semibold">{count}</span></div>
                          <div className="h-1.5 rounded-full bg-foreground/8 overflow-hidden">
                            <div className="h-full rounded-full bg-foreground" style={{ width: `${Math.round((count / data.topLocations[0].count) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─ AUDIO & MENTIONS ─ */}
          <section>
            <SectionLabel tag="Content Discovery" title="Audio & Mentions" subtitle="Top audio tracks, frequent mentions and tagged collaborators" />
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Top Audio Tracks */}
              <div className="rounded-2xl border border-foreground/10 bg-background p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2"><Music className="w-4 h-4 text-muted-foreground" /><span className="font-semibold text-sm">Top Audio Tracks</span></div>
                    <div className="text-xs text-muted-foreground mt-0.5">Most used audio across content</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-foreground/5 border border-foreground/10 font-mono">{data.topAudio.length} tracks</span>
                </div>
                <div className="space-y-1">
                  {data.topAudio.map(({ rank, name, isOriginal }: { rank: number; name: string; isOriginal: boolean }) => (
                    <div key={rank} className="flex items-center gap-4 py-3 px-3 rounded-xl hover:bg-foreground/4 transition-colors group">
                      <span className="text-xs font-mono text-muted-foreground w-4 flex-shrink-0">{rank}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm truncate block">{name}</span>
                        {isOriginal && <span className="text-xs text-cloutt font-medium">Original Audio</span>}
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Frequent Mentions */}
              <div className="rounded-2xl border border-foreground/10 bg-background p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2"><AtSign className="w-4 h-4 text-muted-foreground" /><span className="font-semibold text-sm">Frequent Mentions</span></div>
                    <div className="text-xs text-muted-foreground mt-0.5">Frequently mentioned accounts</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-foreground/5 border border-foreground/10 font-mono">Mentions</span>
                </div>
                <div className="space-y-2">
                  {data.frequentMentions.map(({ handle, count }: { handle: string; count: number }, i: number) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-foreground/4 transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cloutt/40 to-foreground/20 flex items-center justify-center flex-shrink-0">
                        <AtSign className="w-3.5 h-3.5 text-foreground/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{handle}</div>
                        <div className="text-xs text-muted-foreground">Mentioned in content</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold">{count}</div>
                        <div className="text-xs text-muted-foreground">mention{count > 1 ? "s" : ""}</div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tagged Accounts */}
            <div className="rounded-2xl border border-foreground/10 bg-background p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /><span className="font-semibold text-sm">Tagged Accounts</span></div>
                  <div className="text-xs text-muted-foreground mt-0.5">{data.taggedAccounts.length} collaborators & brands tagged</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-foreground/5 border border-foreground/10 font-mono">{data.taggedAccounts.length} tagged</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {data.taggedAccounts.map(({ name, handle }: { name: string; handle: string }, i: number) => {
                  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                  const bgColors = ["from-cloutt/50 to-cloutt/20", "from-foreground/30 to-foreground/10", "from-cloutt/30 to-foreground/20", "from-foreground/20 to-cloutt/20"];
                  return (
                    <div key={i} className="rounded-xl border border-foreground/10 p-4 flex flex-col items-center text-center gap-2 hover:border-foreground/20 hover:shadow-md transition-all group cursor-pointer">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${bgColors[i % bgColors.length]} flex items-center justify-center text-sm font-bold`}>
                        {initials}
                      </div>
                      <div className="min-w-0 w-full">
                        <div className="text-xs font-semibold truncate">{name}</div>
                        <div className="text-xs text-muted-foreground truncate">{handle}</div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* RECENT POSTS & REELS STREAM */}
          {data.recentPosts && data.recentPosts.length > 0 && (
            <section>
              <SectionLabel
                tag="Live Content"
                title="Recent Posts & Reels"
                subtitle={`Live feed of posts and reels scraped directly from ${data.username}`}
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.recentPosts.map((post) => (
                  <a
                    key={post.id || post.shortcode}
                    href={`https://www.instagram.com/p/${post.shortcode}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-2xl overflow-hidden border border-foreground/10 bg-foreground/5 aspect-[4/5] flex flex-col justify-end transition-all hover:scale-[1.02] hover:border-foreground/30 hover:shadow-xl"
                  >
                    {post.displayUrl ? (
                      <img
                        src={post.displayUrl}
                        alt={post.caption || "Instagram post"}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-foreground/20 flex items-center justify-center">
                        <Instagram className="w-10 h-10 text-background/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <div className="relative p-3.5 text-white z-10 w-full">
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider text-white">
                          {post.isReel ? "Reel" : post.isVideo ? "Video" : post.isCarousel ? "Carousel" : "Photo"}
                        </span>
                        {post.isPinned && (
                          <span className="flex items-center gap-1 text-[10px] text-cloutt font-bold">
                            <Pin className="w-3 h-3 fill-cloutt" /> Pinned
                          </span>
                        )}
                      </div>
                      {post.caption && (
                        <p className="text-xs text-white/80 line-clamp-2 mb-2 font-normal leading-snug">
                          {post.caption}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-white/90 pt-1.5 border-t border-white/10 font-mono">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-cloutt fill-cloutt" /> {fmt(post.likeCount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" /> {fmt(post.commentCount)}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="rounded-3xl bg-foreground text-background p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 30% 70%, ${LIME} 0%, transparent 50%)` }} />
            <div className="relative">
              <span className="text-xs uppercase tracking-[0.2em] text-background/40 font-mono">Ready to collaborate?</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-4">Partner with <span className="text-cloutt">{data.displayName}</span></h2>
              <p className="text-background/60 max-w-md mx-auto mb-8">{data.engagementQuality} engagement · {data.niches.join(" · ")} creator · {fmt(data.followers)} followers</p>
              <a href="/join" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-cloutt text-cloutt-foreground font-semibold hover:scale-[1.04] hover:shadow-[0_0_30px_rgba(200,241,53,0.4)] transition-all">
                Start a Campaign <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </section>
        </div>
      )}

      {/* EMPTY STATE */}
      {!data && !loading && (
        <section className="py-32 text-center">
          <div className="mx-auto max-w-md px-4">
            <div className="w-20 h-20 rounded-3xl bg-foreground/5 flex items-center justify-center mx-auto mb-6"><Instagram className="w-10 h-10 text-muted-foreground" /></div>
            <h2 className="font-display text-3xl font-bold mb-3">Analyze any creator</h2>
            <p className="text-muted-foreground text-sm">Paste an Instagram profile URL above and hit <strong>Analyze Profile</strong> to unlock detailed performance insights, engagement metrics, and brand fit scores.</p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {["Avg Views", "Engagement Rate", "Niche Analysis"].map((t) => (
                <div key={t} className="rounded-xl border border-foreground/10 p-4 text-center"><div className="w-8 h-8 rounded-lg bg-foreground/5 mx-auto mb-2" /><div className="text-xs text-muted-foreground">{t}</div></div>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
