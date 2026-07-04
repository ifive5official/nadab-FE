import type { Segment } from "./types";

export function normalizeSegments(segments: Segment[] | undefined): Segment[] {
  return (segments ?? []).map((segment) => ({
    text: segment.text ?? "",
    marks: segment.marks ?? [],
  }));
}

export function splitSegmentsIntoSentences(
  segments: Segment[] | undefined,
): string[] {
  const text = (segments ?? [])
    .map((segment) => segment.text ?? "")
    .join("")
    .trim();

  if (!text) {
    return [];
  }

  return (
    text
      .match(/[^.!?。！？…]+[.!?。！？…]+["'”’)]*|[^.!?。！？…]+$/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? [text]
  );
}

export function getCommentCardWidth(sentence: string, index: number) {
  const widthClassNames = [
    "w-[78%]",
    "w-[92%]",
    "w-[68%]",
    "w-[84%]",
    "w-[74%]",
  ];
  const lengthOffset = sentence.length > 34 ? 1 : sentence.length < 18 ? 2 : 0;
  const styleIndex = (index + lengthOffset) % widthClassNames.length;

  return widthClassNames[styleIndex];
}

export function formatPercent(value: number | undefined) {
  if (typeof value !== "number") {
    return "-";
  }

  return `${value}%`;
}
