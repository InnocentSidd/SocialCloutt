import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../style.css?url";
import { reportLovableError } from "../lib/error/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl font-bold tracking-tight">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page doesn't exist. Yet.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-6 h-11 text-sm font-semibold text-background transition-all hover:scale-[1.04] hover:bg-cloutt hover:text-cloutt-foreground"
          >
            Back home →
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-bold">Something glitched.</h1>
        <p className="mt-2 text-sm text-muted-foreground">We hit a snag rendering this page.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-foreground px-6 h-11 text-sm font-semibold text-background hover:scale-[1.04] hover:bg-cloutt hover:text-cloutt-foreground transition-all"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-foreground px-6 h-11 inline-flex items-center text-sm font-semibold hover:bg-foreground hover:text-background transition-all"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Social Cloutt — Creating Influence. Building Brands." },
      {
        name: "description",
        content:
          "Social Cloutt is a culture-first marketing agency engineering attention for the brands of now. Influencer marketing, brand strategy, content & launches.",
      },
      { name: "author", content: "Social Cloutt" },
      { name: "theme-color", content: "#FBFBF9" },
      { property: "og:title", content: "Social Cloutt — Creating Influence. Building Brands." },
      {
        property: "og:description",
        content: "A culture-first marketing agency engineering attention for the brands of now.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Social Cloutt" },
      { name: "twitter:description", content: "Creating Influence. Building Brands." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
