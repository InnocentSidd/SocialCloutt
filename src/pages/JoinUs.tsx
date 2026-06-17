import { useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitApplication } from "@/services/applications";

type Tab = "influencer" | "marketeer" | "brand";

export const searchSchema = z.object({
  tab: z.enum(["influencer", "marketeer", "brand"]).optional(),
});

const tabs: { key: Tab; label: string; tag: string }[] = [
  { key: "influencer", label: "Influencer", tag: "Creators · talent" },
  { key: "marketeer", label: "Marketeer", tag: "Work with us · careers" },
  { key: "brand", label: "Brand", tag: "Hire us · partnerships" },
];

export default function JoinPage() {
  const search = useSearch({ from: "/join" });
  const navigate = useNavigate({ from: "/join" });
  const active = (search.tab as Tab) ?? "influencer";

  return (
    <PageShell>
      <section className="grain pt-12 md:pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-2 h-2 rounded-full bg-cloutt" />
            <span className="uppercase tracking-[0.2em] text-xs font-medium text-muted-foreground">
              Apply / collaborate
            </span>
          </div>
          <h1 className="font-display font-bold tracking-tight text-[clamp(3rem,11vw,10rem)] leading-[0.85]">
            Slide in.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-foreground/70 max-w-2xl">
            Pick a lane. Tell us what you're about. We read everything that hits the inbox.
          </p>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <div role="tablist" className="grid grid-cols-3 gap-2 mb-10 md:mb-14">
            {tabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={active === t.key}
                onClick={() => navigate({ search: { tab: t.key } })}
                className={
                  "p-4 md:p-6 text-left border-2 transition-all hover:scale-[1.02] " +
                  (active === t.key
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/15 hover:border-foreground/40")
                }
              >
                <div className="text-[10px] uppercase tracking-widest opacity-70">{t.tag}</div>
                <div className="font-display text-2xl md:text-3xl font-bold mt-1">{t.label}</div>
              </button>
            ))}
          </div>

          <div className="border border-foreground/10 bg-card p-6 md:p-10">
            {active === "influencer" && <InfluencerForm />}
            {active === "marketeer" && <MarketeerForm />}
            {active === "brand" && <BrandForm />}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

// ============ Reusable form scaffolding ============

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid md:grid-cols-2 gap-4">{children}</div>;
}
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-widest">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SuccessState({ type, onReset }: { type: Tab; onReset: () => void }) {
  return (
    <div className="text-center py-10 animate-fade-in">
      <div className="inline-block w-12 h-12 rounded-full bg-cloutt mb-6" />
      <h3 className="font-display text-4xl font-bold tracking-tight mb-3">You're in the inbox.</h3>
      <p className="text-foreground/70 max-w-md mx-auto">
        We've received your {type} application. Expect a reply from{" "}
        <span className="font-semibold">socialcloutt@gmail.com</span> within 5 business days.
      </p>
      <Button variant="outline" onClick={onReset} className="mt-8">
        Submit another
      </Button>
    </div>
  );
}

// ============ INFLUENCER ============

const influencerSchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  email: z.string().trim().email("Invalid email").max(320),
  phone: z.string().trim().max(40).optional(),
  handle: z.string().trim().min(1, "Required").max(120),
  platform: z.string().trim().min(1, "Required").max(80),
  followers: z.string().trim().min(1, "Required").max(60),
  niche: z.string().trim().min(1, "Required").max(120),
  location: z.string().trim().min(1, "Required").max(120),
  portfolio: z.string().trim().max(500).optional(),
  pitch: z.string().trim().min(10, "At least 10 chars").max(2000),
});
type InfluencerForm = z.infer<typeof influencerSchema>;

function InfluencerForm() {
  const [done, setDone] = useState(false);
  const submit = useServerFn(submitApplication);
  const form = useForm<InfluencerForm>({ resolver: zodResolver(influencerSchema) });
  const onSubmit = form.handleSubmit(async (v) => {
    try {
      await submit({
        data: {
          type: "influencer",
          name: v.name,
          email: v.email,
          phone: v.phone || "",
          details: {
            handle: v.handle,
            platform: v.platform,
            followers: v.followers,
            niche: v.niche,
            location: v.location,
            portfolio: v.portfolio,
            pitch: v.pitch,
          },
        },
      });
      setDone(true);
      toast.success("Application sent");
    } catch {
      toast.error("Couldn't submit. Try again.");
    }
  });
  if (done)
    return (
      <SuccessState
        type="influencer"
        onReset={() => {
          setDone(false);
          form.reset();
        }}
      />
    );
  const e = form.formState.errors;
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FieldRow>
        <Field label="Full name" error={e.name?.message}>
          <Input {...form.register("name")} />
        </Field>
        <Field label="Email" error={e.email?.message}>
          <Input type="email" {...form.register("email")} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Contact no." error={e.phone?.message}>
          <Input {...form.register("phone")} />
        </Field>
        <Field label="Location" error={e.location?.message}>
          <Input placeholder="City, country" {...form.register("location")} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="User name" error={e.handle?.message}>
          <Input placeholder="@username" {...form.register("handle")} />
        </Field>
        <Field label="Main platform" error={e.platform?.message}>
          <Input placeholder="Instagram / YouTube / Other" {...form.register("platform")} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Followers" error={e.followers?.message}>
          <Input placeholder="e.g. 120k" {...form.register("followers")} />
        </Field>
        <Field label="Niche" error={e.niche?.message}>
          <Input placeholder="Fashion, finance, comedy…" {...form.register("niche")} />
        </Field>
      </FieldRow>
      <Field label="Profile link" error={e.portfolio?.message}>
        <Input placeholder="https://" {...form.register("portfolio")} />
      </Field>
      <Field label="Why Social Cloutt?" error={e.pitch?.message}>
        <Textarea
          rows={5}
          placeholder="What do you want to make with us?"
          {...form.register("pitch")}
        />
      </Field>
      <div className="flex justify-end pt-2">
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending…" : "Send application →"}
        </Button>
      </div>
    </form>
  );
}

// ============ MARKETEER ============

const marketeerSchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  email: z.string().trim().email("Invalid email").max(320),
  phone: z.string().trim().max(40).optional(),
  role: z.string().trim().min(1, "Required").max(120),
  experience: z.string().trim().min(1, "Required").max(60),
  portfolio: z.string().trim().max(500).optional(),
  skills: z.string().trim().min(1, "Required").max(500),
  pitch: z.string().trim().min(10, "At least 10 chars").max(2000),
});
type MarketeerForm = z.infer<typeof marketeerSchema>;

function MarketeerForm() {
  const [done, setDone] = useState(false);
  const submit = useServerFn(submitApplication);
  const form = useForm<MarketeerForm>({ resolver: zodResolver(marketeerSchema) });
  const onSubmit = form.handleSubmit(async (v) => {
    try {
      await submit({
        data: {
          type: "marketeer",
          name: v.name,
          email: v.email,
          phone: v.phone || "",
          details: {
            role: v.role,
            experience: v.experience,
            portfolio: v.portfolio,
            skills: v.skills,
            pitch: v.pitch,
          },
        },
      });
      setDone(true);
      toast.success("Application sent");
    } catch {
      toast.error("Couldn't submit. Try again.");
    }
  });
  if (done)
    return (
      <SuccessState
        type="marketeer"
        onReset={() => {
          setDone(false);
          form.reset();
        }}
      />
    );
  const e = form.formState.errors;
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FieldRow>
        <Field label="Full name" error={e.name?.message}>
          <Input {...form.register("name")} />
        </Field>
        <Field label="Email" error={e.email?.message}>
          <Input type="email" {...form.register("email")} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Contact no." error={e.phone?.message}>
          <Input {...form.register("phone")} />
        </Field>
        <Field label="Role you want" error={e.role?.message}>
          <Input placeholder="Strategist, producer, copy…" {...form.register("role")} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Years of experience" error={e.experience?.message}>
          <Input placeholder="2y, 5y, 10y…" {...form.register("experience")} />
        </Field>
        <Field label="Profile link" error={e.portfolio?.message}>
          <Input placeholder="https://" {...form.register("portfolio")} />
        </Field>
      </FieldRow>
      <Field label="Skills" error={e.skills?.message}>
        <Input
          placeholder="Strategy, performance, editorial, motion…"
          {...form.register("skills")}
        />
      </Field>
      <Field label="What kind of work do you want to make?" error={e.pitch?.message}>
        <Textarea rows={5} {...form.register("pitch")} />
      </Field>
      <div className="flex justify-end pt-2">
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending…" : "Send application →"}
        </Button>
      </div>
    </form>
  );
}

// ============ BRAND ============

const brandSchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  email: z.string().trim().email("Invalid email").max(320),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().min(1, "Required").max(200),
  website: z.string().trim().max(500).optional(),
  industry: z.string().trim().min(1, "Required").max(120),
  budget: z.string().trim().min(1, "Required").max(120),
  goals: z.string().trim().min(10, "At least 10 chars").max(2000),
});
type BrandForm = z.infer<typeof brandSchema>;

function BrandForm() {
  const [done, setDone] = useState(false);
  const submit = useServerFn(submitApplication);
  const form = useForm<BrandForm>({ resolver: zodResolver(brandSchema) });
  const onSubmit = form.handleSubmit(async (v) => {
    try {
      await submit({
        data: {
          type: "brand",
          name: v.name,
          email: v.email,
          phone: v.phone || "",
          details: {
            company: v.company,
            website: v.website,
            industry: v.industry,
            budget: v.budget,
            goals: v.goals,
          },
        },
      });
      setDone(true);
      toast.success("Brief received");
    } catch {
      toast.error("Couldn't submit. Try again.");
    }
  });
  if (done)
    return (
      <SuccessState
        type="brand"
        onReset={() => {
          setDone(false);
          form.reset();
        }}
      />
    );
  const e = form.formState.errors;
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FieldRow>
        <Field label="Your name" error={e.name?.message}>
          <Input {...form.register("name")} />
        </Field>
        <Field label="Work email" error={e.email?.message}>
          <Input type="email" {...form.register("email")} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Contact no." error={e.phone?.message}>
          <Input {...form.register("phone")} />
        </Field>
        <Field label="Company" error={e.company?.message}>
          <Input {...form.register("company")} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Website Link" error={e.website?.message}>
          <Input placeholder="https://" {...form.register("website")} />
        </Field>
        <Field label="Industry" error={e.industry?.message}>
          <Input {...form.register("industry")} />
        </Field>
      </FieldRow>
      <Field label="Product" error={e.budget?.message}>
        <Input placeholder="Skin care, tech, food, lifestyle,..." {...form.register("budget")} />
      </Field>
      <Field label="What are we building?" error={e.goals?.message}>
        <Textarea
          rows={6}
          placeholder="Brief, timeline, goals, references…"
          {...form.register("goals")}
        />
      </Field>
      <div className="flex justify-end pt-2">
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending…" : "Send the brief →"}
        </Button>
      </div>
    </form>
  );
}
