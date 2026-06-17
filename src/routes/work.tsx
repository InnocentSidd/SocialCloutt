import { createFileRoute } from "@tanstack/react-router";
import WorkPage, { campaignsQuery } from "@/pages/Work";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Work — Social Cloutt" },
      {
        name: "description",
        content:
          "Selected campaigns from Social Cloutt — launches, brand films, always-on content engines.",
      },
      { property: "og:title", content: "Work — Social Cloutt" },
      {
        property: "og:description",
        content: "Selected campaigns: launches, brand films, always-on content engines.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(campaignsQuery),
  component: WorkPage,
});
