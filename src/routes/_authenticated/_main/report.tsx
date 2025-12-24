import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/report")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>report</div>;
}
