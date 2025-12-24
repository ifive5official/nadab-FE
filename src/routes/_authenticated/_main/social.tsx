import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/social")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>social</div>;
}
