import type { components } from "@/generated/api-types";

type Segment = components["schemas"]["Segment"];

export function splitSegmentsBySentence(segments: Segment[]): Segment[][] {
  const result: Segment[][] = [];
  let currentSentence: Segment[] = [];

  const sentenceEndRegex = /([.?!](?:\s+|$))/;

  segments.forEach((segment) => {
    const parts = segment.text?.split(sentenceEndRegex).filter(Boolean);

    parts?.forEach((part) => {
      const newSegment: Segment = {
        text: part,
        marks: [...segment.marks!],
      };

      currentSentence.push(newSegment);

      if (sentenceEndRegex.test(part)) {
        result.push(currentSentence);
        currentSentence = [];
      }
    });
  });

  if (currentSentence.length > 0) {
    result.push(currentSentence);
  }

  return result;
}
