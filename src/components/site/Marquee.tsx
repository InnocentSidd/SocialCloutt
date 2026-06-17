interface MarqueeProps {
  items: string[];
  className?: string;
}

export function Marquee({ items, className }: MarqueeProps) {
  const doubled = [...items, ...items];
  return (
    <div
      className={"overflow-hidden border-y border-foreground/10 py-6 md:py-8 " + (className ?? "")}
    >
      <div className="marquee-track gap-12 md:gap-20 items-center">
        {doubled.map((t, i) => (
          <span
            key={i}
            className="font-display text-4xl md:text-7xl font-bold tracking-tight inline-flex items-center gap-12 md:gap-20"
          >
            {t}
            <span className="inline-block w-3 h-3 rounded-full bg-cloutt" />
          </span>
        ))}
      </div>
    </div>
  );
}
