import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PersonaDescriptionContent } from "./TypeReportSlides";

describe("PersonaDescriptionContent", () => {
  it("구조화된 세그먼트가 있으면 기존 문자열보다 우선 표시한다", () => {
    const markup = renderToStaticMarkup(
      <PersonaDescriptionContent
        content={{
          styledText: {
            segments: [
              { text: "일반 설명", marks: [] },
              { text: "강조 설명", marks: ["BOLD"] },
            ],
          },
        }}
        fallback="기존 설명"
      />,
    );

    expect(markup).toContain("일반 설명");
    expect(markup).toContain("강조 설명");
    expect(markup).toContain("font-bold!");
    expect(markup).not.toContain("기존 설명");
  });

  it("구조화된 세그먼트가 없으면 기존 문자열을 표시한다", () => {
    const markup = renderToStaticMarkup(
      <PersonaDescriptionContent
        content={{ styledText: { segments: [] } }}
        fallback="기존 설명"
      />,
    );

    expect(markup).toBe("기존 설명");
  });
});
