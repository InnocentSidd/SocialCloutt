import { createFileRoute } from "@tanstack/react-router";
import CreatorReachPage from "@/pages/CreatorReach";

export const Route = createFileRoute("/creator-reach")({
  head: () => ({
    meta: [
      { title: "Creator Reach Calculator — Social Cloutt" },
      {
        name: "description",
        content:
          "Analyze any Instagram creator's performance — avg views, likes, comments, engagement rate, content analysis, and profile insights. Powered by Social Cloutt.",
      },
      { property: "og:title", content: "Creator Reach Calculator — Social Cloutt" },
      {
        property: "og:description",
        content: "Paste an Instagram profile link and unlock detailed creator performance analytics.",
      },
    ],
  }),
  component: CreatorReachPage,
});
