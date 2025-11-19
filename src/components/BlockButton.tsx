import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import { LoadingIcon } from "./Icons";

type Props = {
  variant?: "primary" | "secondary" | "tertiary";
  disabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;
// Todo: 로딩 상태(로딩 스피너 + disabled) 추가
export default function BlockButton({
  variant = "primary",
  disabled = false,
  isLoading = false,
  children,
  ...props
}: Props) {
  return (
    <button
      disabled={disabled}
      className={clsx(
        "relative w-full text-center text-button-1 rounded-lg py-padding-y-m",
        {
          "bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default":
            variant === "primary" && !disabled,
          "bg-button-secondary-bg-default hover:bg-button-secondary-bg-hover text-button-secondary-text-default":
            variant === "secondary" && !disabled,
          "bg-button-tertiary-bg-default border border-button-tertiary-border-default hover:bg-button-tertiary-bg-hover hover:border-button-tertiary-border-hover text-button-tertiary-text-default":
            variant === "tertiary" && !disabled,
        },
        disabled && "bg-button-disabled-bg text-button-disabled-text"
      )}
      {...props}
    >
      {isLoading ? <LoadingIcon /> : children}
    </button>
  );
}
