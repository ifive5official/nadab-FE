import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Props = {
  size?: "m" | "s";
  variant?: "primary" | "secondary" | "tertiary";
  children: React.ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;
export default function InlineButton({
  size = "m",
  variant = "primary",
  children,
  className,
  ...props
}: Props) {
  return (
    <button
      className={clsx(
        "rounded-[20px]",
        variant === "primary" &&
          "bg-button-primary-bg-default text-button-primary-text-default",
        variant === "secondary" &&
          "bg-button-secondary-bg-default text-button-secondary-text-default",
        variant === "tertiary" &&
          "bg-button-tertiary-bg-default text-button-tertiary-text-default",
        size === "m" && "text-button-2 px-padding-x-m py-padding-y-xs",
        size === "s" && "text-button-3 px-padding-x-xs py-padding-y-xxs",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
