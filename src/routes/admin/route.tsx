import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireRole } from "../../auth/guard";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context }) => {
    requireRole(context.auth, ["admin", "staff"]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}