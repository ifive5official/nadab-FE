import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import { LoadingIcon } from "./Icons";

type Props = {
  variant?: "primary" | "secondary" | "tertiary";
  disabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;
export default function BlockButton({
  variant = "primary",
  disabled = false,
  isLoading = false,
  children,
  className,
  ...props
}: Props) {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        "relative w-full text-center text-button-1 rounded-full py-padding-y-m",
        {
          "bg-button-primary-bg-default text-button-primary-text-default":
            variant === "primary" && !disabled,
          "bg-button-secondary-bg-default text-button-secondary-text-default":
            variant === "secondary" && !disabled,
          "bg-button-tertiary-bg-default border border-button-tertiary-border-default text-button-tertiary-text-default":
            variant === "tertiary" && !disabled,
        },
        disabled && "bg-button-disabled-bg text-button-disabled-text",
        className
      )}
      {...props}
    >
      {isLoading ? <LoadingIcon /> : children}
    </button>
  );
}
