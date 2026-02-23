import SegmentedControls from "@/components/SegmentedControls";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import PeriodicReportTab from "@/features/report/PeriodicReportTab";
import TypeReportTab from "@/features/report/TypeReportTab";
import Container from "@/components/Container";
import {
  periodicReportOptions,
  typeReportOptions,
} from "@/features/report/quries";
import Loading from "@/components/Loading";
import categories from "@/constants/categories";
import clsx from "clsx";

type Tab = "periodic" | "type";

export const Route = createFileRoute("/_authenticated/_main/report")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => {
    return {
      tab: (search.tab as Tab) || "periodic", // 기본값 periodic
    };
  },
  loaderDeps: ({ search: { tab } }) => ({ tab }),
  loader: async ({ deps: { tab }, context: { queryClient } }) => {
    switch (tab) {
      case "periodic":
        await Promise.all([
          queryClient.ensureQueryData(periodicReportOptions("weekly")),
          queryClient.ensureQueryData(periodicReportOptions("monthly")),
        ]);
        break;
      case "type":
        queryClient.ensureQueryData(typeReportOptions);
        break;
    }
  },
  pendingComponent: () => <Loading />,
  pendingMs: 200, // 0.2초 이상 걸릴 때만 로딩 컴포넌트 표시
  pendingMinMs: 200,
});

function RouteComponent() {
  const tab = Route.useSearch().tab ?? "periodic";
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof categories)[number]["code"]>("PREFERENCE");

  const navigate = useNavigate({ from: Route.fullPath });
  function handleTabChange(value: string) {
    navigate({
      search: (prev) => ({ ...prev, tab: value as Tab }),
      replace: true,
    });
  }

  return (
    <Container isMain={true}>
      <SegmentedControls
        options={[
          { label: "주간/월간", value: "periodic" },
          { label: "유형", value: "type" },
        ]}
        selected={tab}
        className="my-padding-y-m"
        onChange={handleTabChange}
      />
      {tab === "type" && (
        <ul className="shrink-0 flex items-center gap-gap-x-s mb-margin-y-l overflow-x-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => {
            const selected = category.code === selectedCategory;
            return (
              <li
                onClick={() => setSelectedCategory(category.code)}
                key={category.code}
                className={clsx(
                  "rounded-lg px-padding-x-m py-1.5 text-button-2 whitespace-pre border",
                  selected
                    ? "bg-brand-primary border-brand-primary text-button-primary-text-default"
                    : "bg-surface-layer-1 border-button-tertiary-border-default text-interactive-text-hover",
                )}
              >
                {category.title}
              </li>
            );
          })}
        </ul>
      )}
      <div className="relative -mx-padding-x-m">
        <div className="border-b border-b-interactive-border-default w-full" />
      </div>
      {tab === "periodic" && <PeriodicReportTab />}
      {tab === "type" && <TypeReportTab category={selectedCategory} />}
    </Container>
  );
}
