import clsx from "clsx";
import type { ReactNode } from "react";

type ReportSectionHeaderProps = {
  caption: ReactNode;
  title: ReactNode;
};

export function ReportSectionHeader({
  caption,
  title,
}: ReportSectionHeaderProps) {
  return (
    <header className="flex flex-col gap-y-gap-y-xs">
      <span className="text-caption-m text-text-secondary">{caption}</span>
      <h1 className="text-title-3 break-keep text-text-primary">{title}</h1>
    </header>
  );
}

type IconLabelProps = {
  iconSrc: string;
  label: ReactNode;
  alt?: string;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
};

export function IconLabel({
  iconSrc,
  label,
  alt = "",
  className,
  iconClassName = "aspect-square w-6 mr-0.5",
  labelClassName = "text-label-m text-text-secondary",
}: IconLabelProps) {
  return (
    <div className={clsx("flex items-center", className)}>
      <img className={iconClassName} src={iconSrc} alt={alt} />
      <span className={labelClassName}>{label}</span>
    </div>
  );
}

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
  surface?: "layer" | "base";
  border?: boolean;
  roundedClassName?: string;
  paddingClassName?: string;
};

export function SurfaceCard({
  children,
  className,
  surface = "layer",
  border = true,
  roundedClassName = "rounded-xl",
  paddingClassName = "px-padding-x-m py-padding-y-m",
}: SurfaceCardProps) {
  return (
    <div
      className={clsx(
        roundedClassName,
        paddingClassName,
        border && "border border-border-base",
        surface === "layer" ? "bg-surface-layer-1" : "bg-surface-base",
        className,
      )}
    >
      {children}
    </div>
  );
}

type FullBleedReportBannerProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function FullBleedReportBanner({
  children,
  className,
  contentClassName,
}: FullBleedReportBannerProps) {
  return (
    <section
      className={clsx(
        "-mx-padding-x-m bg-[url(/periodic-report-bg.png)] bg-cover bg-center px-padding-x-m",
        className,
      )}
    >
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
