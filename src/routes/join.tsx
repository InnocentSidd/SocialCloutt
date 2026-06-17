import { createFileRoute } from "@tanstack/react-router";
import JoinPage, { searchSchema } from "@/pages/JoinUs";

export const Route = createFileRoute("/join")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Join Us — Social Cloutt" },
      {
        name: "description",
        content:
          "Apply to Social Cloutt as an influencer, marketeer, or brand. We're always looking for the next great collaborator.",
      },
      { property: "og:title", content: "Join Us — Social Cloutt" },
      { property: "og:description", content: "Apply as an influencer, marketeer, or brand." },
    ],
  }),
  component: JoinPage,
});
