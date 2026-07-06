import { CutoutOverlay } from "./CutoutOverlay";
import type { Rect } from "./types";

type DimLayerProps = {
  interactiveModalMaskId: string;
  interactiveModalRect?: Rect;
};

export function DimLayer({
  interactiveModalMaskId,
  interactiveModalRect,
}: DimLayerProps) {
  if (!interactiveModalRect) {
    return <div className="fixed inset-0 bg-neutral-dark-50 z-[55]" />;
  }

  return (
    <CutoutOverlay
      maskId={interactiveModalMaskId}
      rect={interactiveModalRect}
    />
  );
}
