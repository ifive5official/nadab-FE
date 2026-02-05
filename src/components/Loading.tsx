import { LoadingIcon } from "./Icons";

export default function Loading() {
  return (
    <div className="flex-1 flex justify-center items-center">
      <LoadingIcon color="var(--color-icon-primary)" />
    </div>
  );
}
