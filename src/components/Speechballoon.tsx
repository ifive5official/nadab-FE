import {
  ChatVerificationReceptionIcon,
  CharVerificationSendingIcon,
} from "@/components/Icons";
import clsx from "clsx";

type Props = {
  direction?: "receive" | "send";
  children: React.ReactNode;
  textColor: string;
  bgColor: string;
  className?: string;
};

export default function SpeechBalloon({
  direction = "receive",
  children,
  textColor,
  bgColor,
  className,
}: Props) {
  return (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className={clsx(
        "relative text-caption-l w-fit rounded-xl",
        direction === "send" ? "ml-auto" : "",
      )}
    >
      {direction === "receive" && (
        <ChatVerificationReceptionIcon
          style={{ color: bgColor }}
          className={clsx("absolute top-0 -left-0.5")}
        />
      )}
      {direction === "send" && (
        <CharVerificationSendingIcon
          style={{ color: bgColor }}
          className={clsx("absolute top-0 -right-0.5")}
        />
      )}
      <div className={clsx("w-fit px-padding-x-m py-padding-y-xs", className)}>
        {children}
      </div>
    </div>
  );
}
