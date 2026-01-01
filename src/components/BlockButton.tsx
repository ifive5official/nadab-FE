import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import { LoadingIcon } from "./Icons";

type Props = {
  btnType?: "block" | "inline";
  // white - 소셜 로그인 버튼 위해 임시로 만들어둠
  variant?: "primary" | "secondary" | "tertiary" | "white" | "disabled";
  disabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;
export default function BlockButton({
  btnType = "block",
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
        "relative text-center text-button-1 rounded-full",
        {
          "w-full py-padding-y-m": btnType === "block",
          "w-fit py-padding-y-xs px-padding-x-m": btnType === "inline",
        },
        {
          "bg-button-gradient-1 shadow-button-1 active:shadow-button-1-2 text-button-primary-text-default after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none after:shadow-[inset_-4px_-4px_10px_0px_rgba(7,8,117,0.6)] after:mix-blend-overlay active:after:shadow-none":
            variant === "primary" && !disabled,
          "bg-button-gradient-2 shadow-button-2 active:shadow-button-2-2 text-button-secondary-text-default after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none after:shadow-[inset_-4px_-4px_5px_0px_rgba(32,24,75,1)] after:mix-blend-overlay active:after:shadow-none":
            variant === "secondary" && !disabled,
          "bg-surface-layer-1 border border-border-base text-button-tertiary-text-default":
            variant === "tertiary" && !disabled,
          "bg-field-bg-default border border-border-base":
            variant === "white" && !disabled,
        },
        (disabled || variant === "disabled") &&
          "bg-button-gradient-3 shadow-button-3 text-button-disabled-text after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none after:shadow-[inset_-4px_-4px_10px_0px_rgba(7,8,117,0.6)] after:mix-blend-overlay active:after:shadow-none",
        className
      )}
      {...props}
    >
      {isLoading ? <LoadingIcon /> : children}
    </button>
  );
}
