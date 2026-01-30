import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import { LoadingIcon } from "./Icons";

type Props = {
  size?: "m" | "s";
  variant?: "primary" | "secondary" | "tertiary";
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;
export default function InlineButton({
  size = "m",
  variant = "primary",
  children,
  className,
  isLoading = false,
  disabled = false,
  ...props
}: Props) {
  return (
    <button
      className={clsx(
        "relative flex items-center justify-center rounded-[20px]",
        variant === "primary" &&
          !disabled &&
          "bg-button-primary-bg-default text-button-primary-text-default",
        variant === "secondary" &&
          !disabled &&
          "bg-button-secondary-bg-default text-button-secondary-text-default",
        variant === "tertiary" &&
          !disabled &&
          "bg-button-tertiary-bg-default text-button-tertiary-text-default border border-button-tertiary-border-default",
        disabled && "bg-button-disabled-bg text-button-disabled-text",
        size === "m" && "text-button-2 px-padding-x-m py-padding-y-xs",
        size === "s" && "text-button-3 px-padding-x-xs py-1.5",
        className,
      )}
      {...props}
      disabled={isLoading || disabled}
    >
      {isLoading && (
        <div className="absolute">
          <LoadingIcon
            height={size === "m" ? 18 : 14}
            color={
              variant !== "primary" ? "var(--color-brand-primary)" : "white"
            }
          />
        </div>
      )}
      <span className={clsx(isLoading && "invisible")}>{children}</span>
    </button>
  );
}
