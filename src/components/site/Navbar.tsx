import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
  { to: "/creator-reach", label: "Creator Reach" },
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        open ? "h-screen bg-background" : "h-auto",
        scrolled && !open ? "backdrop-blur-md bg-background/70 border-b border-border" : "bg-transparent",
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
          className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-full border border-foreground/20 cursor-pointer"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in flex flex-col justify-between h-[calc(100vh-64px)] p-6 pb-16 overflow-y-auto">
          <div className="flex flex-col gap-6 pt-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-3xl font-display font-bold tracking-tight hover:text-cloutt transition-colors border-b border-border/40 pb-3"
                onClick={() => setOpen(false)}
                activeProps={{ className: "text-cloutt" }}
                activeOptions={{ exact: true }}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-4 mb-6">
            <Button asChild size="lg" className="w-full">
              <Link to="/join" onClick={() => setOpen(false)}>
                Join Us →
              </Link>
            </Button>
            <div className="text-center text-xs text-muted-foreground font-mono space-y-1">
              <div>socialcloutt@gmail.com</div>
              <div>India · Est. 2024</div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
