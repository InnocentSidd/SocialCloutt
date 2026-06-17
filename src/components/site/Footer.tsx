import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-20">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="font-display text-4xl md:text-5xl font-bold leading-none">
              Creating
              <br /> Influence.
              <br />
              <span className="text-cloutt">Building Brands.</span>
            </div>
            <p className="mt-6 text-sm text-background/60 max-w-xs">
              Social Cloutt — a culture-first marketing agency engineering attention for the brands
              of now.
            </p>
          </div>

          <div className="text-sm space-y-3">
            <div className="text-background/40 uppercase tracking-widest text-xs mb-2">Studio</div>
            <Link to="/work" className="block hover:text-cloutt transition-colors">
              Work
            </Link>
            <Link to="/about" className="block hover:text-cloutt transition-colors">
              About
            </Link>
            <Link to="/join" className="block hover:text-cloutt transition-colors">
              Join Us
            </Link>
          </div>

          <div className="text-sm space-y-3">
            <div className="text-background/40 uppercase tracking-widest text-xs mb-2">
              Apply as
            </div>
            <Link
              to="/join"
              search={{ tab: "influencer" } as never}
              className="block hover:text-cloutt transition-colors"
            >
              Influencer
            </Link>
            <Link
              to="/join"
              search={{ tab: "marketeer" } as never}
              className="block hover:text-cloutt transition-colors"
            >
              Marketeer
            </Link>
            <Link
              to="/join"
              search={{ tab: "brand" } as never}
              className="block hover:text-cloutt transition-colors"
            >
              Brand
            </Link>
          </div>

          <div className="text-sm space-y-3">
            <div className="text-background/40 uppercase tracking-widest text-xs mb-2">Contact</div>
            <a
              href="mailto:socialcloutt@gmail.com"
              className="flex items-center gap-2 hover:text-cloutt"
            >
              <Mail className="w-4 h-4" /> socialcloutt@gmail.com
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-cloutt"
            >
              <Instagram className="w-4 h-4" /> Instagram
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-cloutt"
            >
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-background/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-background/40">
          <div>© {new Date().getFullYear()} Social Cloutt. All rights reserved.</div>
          <Link to="/auth" className="hover:text-background/80">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
