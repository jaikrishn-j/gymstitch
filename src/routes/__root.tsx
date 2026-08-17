import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { AuthState } from "../auth/auth-types";

export const Route = createRootRouteWithContext<{ auth: AuthState }>()({
  component: () => <Outlet />,
});