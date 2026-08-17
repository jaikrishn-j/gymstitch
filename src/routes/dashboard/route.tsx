import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireAuth } from "../../auth/guard";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ context }) => {
    const user = requireAuth(context.auth);

    if (user.role === "member") {
      throw redirect({ to: "/member" });
    }

    throw redirect({ to: "/admin/dashboard" });
  },
  component: () => null,
});