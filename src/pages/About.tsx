import { Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { listPublicTeam } from "@/services/public-content";

export const teamQuery = queryOptions({
  queryKey: ["public", "team"],
  queryFn: () => listPublicTeam(),
});

const values = [
  {
    n: "01",
    title: "Culture > clout",
    body: "We chase relevance, not vanity metrics. Trends fade; cultural memory stays.",
  },
  {
    n: "02",
    title: "Made by Gen-Z",
    body: "The people running your campaign live inside the platforms — not above them.",
  },
  {
    n: "03",
    title: "Editorial discipline",
    body: "Every asset is treated like a magazine spread. Craft is non-negotiable.",
  },
  {
    n: "04",
    title: "Numbers + nuance",
    body: "We obsess over data. But we know the brief is bigger than the spreadsheet.",
  },
];

function HeroSection() {
  return (
    <div
      className="relative w-full min-h-[800px] flex items-center justify-center overflow-hidden bg-black text-white py-20"
      style={{
        backgroundImage: "url('/BG.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
      <div className="relative z-10 w-full max-w-7xl px-5 md:px-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-block w-2 h-2 rounded-full bg-cloutt" />
          <span className="uppercase tracking-[0.2em] text-xs font-medium text-white/80">
            About the studio
          </span>
        </div>
        <h1 className="font-display font-bold tracking-tight text-[clamp(3rem,10vw,8rem)] leading-[0.85] text-white">
          We make
          <br />
          <span className="italic font-normal text-cloutt">brands</span> people
          <br />
          actually screenshot.
        </h1>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const { data: team } = useSuspenseQuery(teamQuery);

  return (
    <PageShell>
      {/* HERO */}
      <HeroSection />

      {/* MANIFESTO */}
      <section className="py-16 md:py-24 border-y border-foreground/10">
        <div className="mx-auto max-w-5xl px-5 md:px-8 grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16">
          <div className="text-xs uppercase tracking-widest text-muted-foreground sticky top-24 self-start">
            Manifesto
          </div>
          <div className="font-display text-2xl md:text-4xl font-medium leading-tight tracking-tight space-y-6">
            <p>
              Social Cloutt was built on a simple idea: the brands that win in 2026 aren't the
              loudest — they're the ones culture decides to care about.
            </p>
            <p>
              We sit at the intersection of <span className="bg-cloutt px-1">creators</span>,
              brands, and the chaos of the feed. We engineer moments, not impressions.
            </p>
            <p className="text-foreground/60">
              Six disciplines. One team. Zero patience for forgettable work.
            </p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-12">
            How we work.
          </h2>
          <div className="grid md:grid-cols-2 gap-px bg-foreground/10">
            {values.map((v) => (
              <div key={v.n} className="bg-background p-8 md:p-12">
                <div className="text-xs font-mono opacity-40 mb-6">{v.n}</div>
                <h3 className="font-display text-3xl md:text-4xl font-bold mb-3 tracking-tight">
                  {v.title}
                </h3>
                <p className="text-foreground/70">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      {team.length > 0 && (
        <section className="py-20 md:py-28 bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-12">
              The crew.
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {team.map((m) => (
                <div key={m.id} className="group">
                  <div className="aspect-[4/5] bg-background/10 mb-3 relative overflow-hidden">
                    {m.image ? (
                      <img
                        src={m.image}
                        alt={m.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center font-display text-7xl font-bold text-background/20">
                        {m.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="font-display text-xl font-bold">{m.name}</div>
                  <div className="text-xs text-cloutt uppercase tracking-widest">{m.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 md:py-32 text-center">
        <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight">Want in?</h2>
        <p className="mt-4 text-muted-foreground">
          Influencer, marketeer, or brand — there's a door.
        </p>
        <Button asChild size="xl" className="mt-10">
          <Link to="/join">Apply →</Link>
        </Button>
      </section>
    </PageShell>
  );
}
