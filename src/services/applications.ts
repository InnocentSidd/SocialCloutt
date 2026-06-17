import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase, ensureDb } from "@/lib/db";
import crypto from "node:crypto";

const baseDetails = {
  influencer: z.object({
    handle: z.string().trim().min(1).max(120),
    platform: z.string().trim().min(1).max(80),
    followers: z.string().trim().min(1).max(60),
    niche: z.string().trim().min(1).max(120),
    location: z.string().trim().min(1).max(120),
    portfolio: z.string().trim().max(500).optional(),
    pitch: z.string().trim().min(10).max(2000),
  }),
  marketeer: z.object({
    role: z.string().trim().min(1).max(120),
    experience: z.string().trim().min(1).max(60),
    portfolio: z.string().trim().max(500).optional(),
    skills: z.string().trim().min(1).max(500),
    pitch: z.string().trim().min(10).max(2000),
  }),
  brand: z.object({
    company: z.string().trim().min(1).max(200),
    website: z.string().trim().max(500).optional(),
    industry: z.string().trim().min(1).max(120),
    budget: z.string().trim().min(1).max(120),
    goals: z.string().trim().min(10).max(2000),
  }),
};

const applicationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("influencer"),
    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(320),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    details: baseDetails.influencer,
  }),
  z.object({
    type: z.literal("marketeer"),
    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(320),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    details: baseDetails.marketeer,
  }),
  z.object({
    type: z.literal("brand"),
    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(320),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    details: baseDetails.brand,
  }),
]);

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const submitApplication = createServerFn({ method: "POST" })
  .validator(applicationSchema)
  .handler(async ({ data }) => {
    await ensureDb();
    try {
      const { error } = await supabase
        .from("applications")
        .insert({
          id: crypto.randomUUID(),
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          type: data.type,
          details: data.details,
        });

      if (error) throw error;
      return { ok: true };
    } catch (error) {
      console.error("submitApplication error", error);
      throw new Error("Could not submit application");
    }
  });
