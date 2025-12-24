import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/calendar")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>calendar</div>;
}
