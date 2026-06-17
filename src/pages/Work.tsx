import { Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { listPublicCampaigns } from "@/services/public-content";

export const campaignsQuery = queryOptions({
  queryKey: ["public", "campaigns"],
  queryFn: () => listPublicCampaigns(),
});

export default function WorkPage() {
  const { data: campaigns } = useSuspenseQuery(campaignsQuery);
  const [filter, setFilter] = useState<string>("all");
  const categories = Array.from(
    new Set(campaigns.map((c) => c.category).filter(Boolean)),
  ) as string[];
  const filtered = filter === "all" ? campaigns : campaigns.filter((c) => c.category === filter);

  return (
    <PageShell>
      <section className="pt-12 md:pt-20 pb-12 md:pb-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-2 h-2 rounded-full bg-cloutt" />
            <span className="uppercase tracking-[0.2em] text-xs font-medium text-muted-foreground">
              Selected work
            </span>
          </div>
          <h1 className="font-display font-bold tracking-tight text-[clamp(3rem,11vw,10rem)] leading-[0.85]">
            The receipts.
          </h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-foreground/70">
            Real campaigns. Real numbers. Real cultural impact. Here's a taste of the brands we've
            sharpened.
          </p>
        </div>
      </section>

      {categories.length > 0 && (
        <div className="border-y border-foreground/10 sticky top-16 md:top-20 bg-background/80 backdrop-blur z-30">
          <div className="mx-auto max-w-7xl px-5 md:px-8 flex gap-2 overflow-x-auto py-3">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
              All
            </FilterChip>
            {categories.map((c) => (
              <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)}>
                {c}
              </FilterChip>
            ))}
          </div>
        </div>
      )}

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8 grid md:grid-cols-2 gap-8 md:gap-16">
          {filtered.map((c, i) => (
            <article key={c.id} className={"group cursor-default " + (i % 2 ? "md:mt-24" : "")}>
              <div className="aspect-[4/5] bg-foreground/5 mb-5 relative overflow-hidden">
                {c.cover_image ? (
                  <img
                    src={c.cover_image}
                    alt={c.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-display text-9xl font-bold text-foreground/10">
                    {c.title.charAt(0)}
                  </div>
                )}
                <div className="absolute top-5 left-5 text-xs uppercase tracking-widest bg-background px-2 py-1">
                  {c.category}
                </div>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    {c.client}
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                    {c.title}
                  </h2>
                  {c.description && (
                    <p className="mt-3 text-sm text-foreground/70 max-w-md">{c.description}</p>
                  )}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-xs border-t border-foreground/10 pt-4">
                <Stat label="Reach" value={c.reach} />
                <Stat label="Engagement" value={c.engagement} />
                <Stat label="Result" value={c.results} />
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            No campaigns in this category yet.
          </div>
        )}
      </section>

      <section className="py-20 text-center">
        <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-8">
          Got the next one?
        </h2>
        <Button asChild size="xl">
          <Link to="/join">Pitch us a brief →</Link>
        </Button>
      </section>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div className="text-muted-foreground uppercase tracking-widest text-[10px]">{label}</div>
      <div className="font-display font-bold text-lg">{value || "—"}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-4 h-9 rounded-full text-xs font-semibold tracking-tight whitespace-nowrap transition-all " +
        (active
          ? "bg-foreground text-background"
          : "border border-foreground/20 hover:border-foreground")
      }
    >
      {children}
    </button>
  );
}
