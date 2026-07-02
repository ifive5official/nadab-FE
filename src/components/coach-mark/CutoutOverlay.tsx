import type { Rect } from "./types";

type CutoutOverlayProps = {
  blockCutout?: boolean;
  maskId: string;
  rect: Rect;
};

export function CutoutOverlay({
  blockCutout = false,
  maskId,
  rect,
}: CutoutOverlayProps) {
  return (
    <>
      <svg className="pointer-events-none fixed inset-0 z-[55] h-full w-full">
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={rect.left}
              y={rect.top}
              width={rect.width}
              height={rect.height}
              rx={rect.radius}
              ry={rect.radius}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          className="fill-neutral-dark-50"
          mask={`url(#${maskId})`}
        />
      </svg>
      <div
        className="fixed z-[56]"
        style={{
          top: 0,
          left: 0,
          right: 0,
          height: rect.top,
        }}
      />
      <div
        className="fixed z-[56]"
        style={{
          top: rect.top + rect.height,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <div
        className="fixed z-[56]"
        style={{
          top: rect.top,
          left: 0,
          width: rect.left,
          height: rect.height,
        }}
      />
      <div
        className="fixed z-[56]"
        style={{
          top: rect.top,
          left: rect.left + rect.width,
          right: 0,
          height: rect.height,
        }}
      />
      {blockCutout && (
        <div
          className="fixed z-[56]"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        />
      )}
    </>
  );
}
