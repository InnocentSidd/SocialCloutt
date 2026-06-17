import { createFileRoute } from "@tanstack/react-router";
import AuthPage from "@/pages/Auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin — Social Cloutt" },
      { name: "description", content: "Social Cloutt admin sign-in." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});
