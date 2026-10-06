import { Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Marquee } from "@/components/site/Marquee";
import { Button } from "@/components/ui/button";
import { listPublicCampaigns, listPublicTestimonials } from "@/services/public-content";

export const campaignsQuery = queryOptions({
  queryKey: ["public", "campaigns"],
  queryFn: () => listPublicCampaigns(),
});

export const testimonialsQuery = queryOptions({
  queryKey: ["public", "testimonials"],
  queryFn: () => listPublicTestimonials(),
});

const services = [
  {
    n: "01",
    title: "Influencer Marketing",
    body: "End-to-end creator campaigns — strategy, casting, contracts, content, measurement.",
  },
  {
    n: "02",
    title: "Brand Strategy",
    body: "Positioning, narrative, identity systems — built for a feed-first world.",
  },
  {
    n: "03",
    title: "Content & Creative",
    body: "Editorial-grade content engines: shoots, edits, copy, sound design.",
  },
  {
    n: "04",
    title: "Launches & Drops",
    body: "Cultural moments engineered around your product — from teaser to sell-out.",
  },
  {
    n: "05",
    title: "Always-On Social",
    body: "Daily content, community ops, performance creative. We run the room.",
  },
  {
    n: "06",
    title: "Talent Management",
    body: "We represent the creators shaping the next decade.",
  },
];

export default function HomePage() {
  const { data: campaigns } = useSuspenseQuery(campaignsQuery);
  const { data: testimonials } = useSuspenseQuery(testimonialsQuery);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Social Cloutt",
    description: "Creating Influence. Building Brands.",
    email: "socialcloutt@gmail.com",
    slogan: "Creating Influence. Building Brands.",
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <section
        className="relative w-full min-h-[600px] md:min-h-[800px] flex items-center justify-center overflow-hidden bg-black text-white py-20"
        style={{
          backgroundImage: "url('BG.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "right 100%",
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />

        <div className="relative z-10 w-full max-w-7xl px-5 md:px-8">
          <div className="flex items-center gap-3 mb-4 md:mb-8">
            <span className="inline-block w-2 h-2 rounded-full bg-cloutt" />
            <span className="uppercase tracking-[0.2em] text-xs font-medium text-white/70">
              India · Est. 2024 · Culture-first
            </span>
          </div>

          <h1 className="font-display font-bold tracking-tight text-[clamp(2.75rem,10vw,11rem)] leading-[0.85]">
            Creating
            <br />
            Influence.
            <br />
            <span className="italic font-normal">Building</span>{" "}
            <span className="relative inline-block">
              Brands.
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-cloutt -z-10 -skew-y-1" />
            </span>
          </h1>

          <div className="mt-10 md:mt-16 grid md:grid-cols-[2fr_1fr] gap-8 items-end">
            <p className="text-lg md:text-2xl max-w-2xl leading-snug">
              We're Social Cloutt — a marketing agency engineering attention, shaping culture, and
              turning brands into the things people screenshot.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/join">Work with us</Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link to="/work">See the work</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <Marquee items={["Influence", "Strategy", "Content", "Culture", "Launches", "Talent"]} />

      {/* SERVICES */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 md:mb-20">
            <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
              What we do.
            </h2>
            <p className="text-muted-foreground max-w-md">
              A full-stack agency for brands that refuse to be background noise. Six disciplines,
              one team.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/10">
            {services.map((s) => (
              <div
                key={s.n}
                className="group bg-background p-6 md:p-10 transition-colors hover:bg-foreground hover:text-background cursor-default"
              >
                <div className="flex items-start justify-between mb-8">
                  <span className="text-xs font-mono tracking-widest opacity-50">{s.n}</span>
                  <ArrowUpRight className="w-5 h-5 opacity-30 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-4">
                  {s.title}
                </h3>
                <p className="text-sm opacity-70">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-5xl px-5 md:px-8">
            <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-12 md:mb-16">
              Word of mouth.
            </h2>
            <div className="space-y-12 md:space-y-16">
              {testimonials.map((t) => (
                <figure key={t.id} className="border-t border-foreground/15 pt-8 md:pt-12">
                  <blockquote className="font-display text-3xl md:text-5xl font-bold leading-[1.05] tracking-tight">
                    "{t.quote}"
                  </blockquote>
                  <figcaption className="mt-6 text-sm">
                    <span className="font-semibold">{t.author}</span>
                    {t.role && <span className="text-muted-foreground"> — {t.role}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section
        className="relative py-20 md:py-32 overflow-hidden "
        style={{
          backgroundImage: "url('/BG1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Backdrop Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" />

        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-5 md:px-8 text-center text-white">
          <h2 className="font-display font-bold tracking-tight text-[clamp(2.75rem,10vw,9rem)] leading-[0.9]">
            Let's make
            <br />
            <span className="italic font-normal">something loud.</span>{" "}
          </h2>

          <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center items-center w-full max-w-md mx-auto sm:max-w-none">
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link to="/join">Start a project →</Link>
            </Button>

            <Button asChild size="xl" className="w-full sm:w-auto">
              <a href="mailto:socialcloutt@gmail.com">socialcloutt@gmail.com</a>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
