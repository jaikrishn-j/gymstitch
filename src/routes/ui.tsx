import { createFileRoute } from "@tanstack/react-router";
import { UiSuitePage } from "../pages/UiSuitePage";

export const Route = createFileRoute("/ui")({
  component: RouteComponent,
});

function RouteComponent() {
  return <UiSuitePage />;
}