import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "backdrop-blur-md bg-background/70 border-b border-border" : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8 h-16 md:h-20">
        <Link to="/" className="font-display text-xl md:text-2xl font-bold tracking-tight">
          social<span className="text-foreground">cloutt</span>
          <span className="inline-block w-1.5 h-1.5 ml-0.5 rounded-full bg-cloutt align-baseline" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium tracking-tight hover:text-foreground/60 transition-colors"
              activeProps={{ className: "text-foreground/40" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
          <Button asChild size="sm">
            <Link to="/join">Join Us →</Link>
          </Button>
        </div>

        <button
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-full border border-foreground/20"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="flex flex-col p-6 gap-5">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-2xl font-display font-bold"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Button asChild size="lg" className="mt-2 self-start">
              <Link to="/join" onClick={() => setOpen(false)}>
                Join Us →
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
