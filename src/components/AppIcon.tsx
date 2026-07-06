import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { iconAssets, type AppIconName } from "@/assets/icons/generated/appIconAssets";

export const appIconColorClassNames = {
  default: "text-icon-default",
  hover: "text-icon-hover",
  muted: "text-icon-muted",
  disabled: "text-icon-disabled",
  primary: "text-icon-primary",
  success: "text-icon-success",
  warning: "text-icon-warning",
  error: "text-icon-error",
  info: "text-icon-info",
  inverse: "text-icon-inverse",
  inverseHover: "text-icon-inverse-hover",
  current: "text-current",
} as const;

export type AppIconColor = keyof typeof appIconColorClassNames;
export type AppIconSize = number | string;

type NativeSvgProps = Omit<
  ComponentPropsWithoutRef<"svg">,
  "children" | "color" | "height" | "width"
>;

export interface AppIconProps extends NativeSvgProps {
  name: AppIconName;
  size?: AppIconSize;
  width?: AppIconSize;
  height?: AppIconSize;
  color?: AppIconColor;
  title?: string;
  decorative?: boolean;
}

export function AppIcon({
  name,
  size = 24,
  width,
  height,
  color = "default",
  className,
  title,
  decorative,
  ...props
}: AppIconProps) {
  const Icon = iconAssets[name];
  const isDecorative = decorative ?? !title;

  return (
    <Icon
      aria-hidden={isDecorative ? true : undefined}
      className={clsx(
        "inline-block shrink-0 align-middle",
        appIconColorClassNames[color],
        className,
      )}
      focusable="false"
      height={height ?? size}
      role={isDecorative ? undefined : "img"}
      title={isDecorative ? undefined : title}
      width={width ?? size}
      {...props}
    />
  );
}

export type { AppIconName };
