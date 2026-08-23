// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AskMarkdownContent } from "./AskMarkdownContent";

describe("AskMarkdownContent", () => {
  it("볼드와 목록을 마크다운 요소로 표시한다", () => {
    const { container } = render(
      <AskMarkdownContent content={"**중요한 답변**\n\n- 첫 번째\n- 두 번째"} />,
    );

    expect(container.querySelector("strong")?.textContent).toBe("중요한 답변");
    expect(container.querySelectorAll("li")).toHaveLength(2);
  });

  it("HTML은 렌더링하지 않고 링크를 안전하게 연다", () => {
    const { container } = render(
      <AskMarkdownContent
        content={'<script>alert("xss")</script>\n\n[관련 내용](https://example.com)'}
      />,
    );

    expect(container.querySelector("script")).toBeNull();
    expect(
      container.querySelector("a")?.getAttribute("rel"),
    ).toBe("noopener noreferrer");
  });
});
