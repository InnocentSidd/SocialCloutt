import { createFileRoute } from "@tanstack/react-router";
import HomePage, { campaignsQuery, testimonialsQuery } from "@/pages/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Social Cloutt — Creating Influence. Building Brands." },
      {
        name: "description",
        content:
          "A culture-first marketing agency engineering attention for the brands of now. Influencer marketing, content, and brand strategy.",
      },
      { property: "og:title", content: "Social Cloutt — Creating Influence. Building Brands." },
      {
        property: "og:description",
        content: "A culture-first marketing agency engineering attention for the brands of now.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(campaignsQuery),
      context.queryClient.ensureQueryData(testimonialsQuery),
    ]);
  },
  component: HomePage,
});
