import { createFileRoute } from "@tanstack/react-router";
import AdminPage from "@/pages/Admin";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Admin — Social Cloutt" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminPage,
});
