import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginFn, signupFn, checkAuthFn } from "@/services/auth";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthFn()
      .then(() => {
        navigate({ to: "/admin" });
      })
      .catch(() => {
        // Not authenticated
      });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        await loginFn({ data: { email, password } });
        toast.success("Welcome back");
        navigate({ to: "/admin" });
      } else {
        await signupFn({ data: { email, password } });
        toast.success("Account created — signed in");
        navigate({ to: "/admin" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <section className="min-h-[80vh] flex items-center justify-center px-5 py-20">
        <div className="w-full max-w-md">
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight mb-2">
            {mode === "signin" ? "Sign in." : "Create admin."}
          </h1>
          <p className="text-muted-foreground mb-10 text-sm">
            Admin access for Social Cloutt staff only.
          </p>
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest">Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest">Password</Label>
              <Input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "…" : mode === "signin" ? "Sign in →" : "Create account →"}
            </Button>
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="block mx-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === "signin"
                ? "Need an admin account? Create one →"
                : "Already have one? Sign in →"}
            </button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
