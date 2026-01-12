import SearchBar from "@/components/SearchBar";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/calendar")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Link to="/search">
        <div className="pointer-events-none">
          {/* @ts-ignore */}
          <SearchBar className="mt-margin-y-m h-11" />
        </div>
      </Link>
    </>
  );
}
