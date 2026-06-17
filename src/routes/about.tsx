import { createFileRoute } from "@tanstack/react-router";
import AboutPage, { teamQuery } from "@/pages/About";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Social Cloutt" },
      {
        name: "description",
        content:
          "Social Cloutt is a culture-first marketing agency. We're builders, creators, and strategists who refuse to be background noise.",
      },
      { property: "og:title", content: "About — Social Cloutt" },
      {
        property: "og:description",
        content: "A culture-first marketing agency. Builders, creators, strategists.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(teamQuery),
  component: AboutPage,
});
