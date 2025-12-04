import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(account)/account/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>test</div>;
}
