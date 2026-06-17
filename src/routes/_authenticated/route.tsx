import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { checkAuthFn } from "@/services/auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    try {
      const user = await checkAuthFn();
      return { user };
    } catch (error) {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});
