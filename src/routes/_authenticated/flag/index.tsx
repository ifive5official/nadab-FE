import BlockButton from "@/components/BlockButton";
import CheckBox from "@/components/Checkbox";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/flag/")({
  component: RouteComponent,
});

function RouteComponent() {
  const initialReasons = [
    { id: "PROFANITY_HATE_SPEECH", label: "욕설 / 혐오 표현", checked: false },
    { id: "SEXUAL_CONTENT", label: "성적으로 부적절한 언행", checked: false },
    { id: "SELF_HARM", label: "자해 / 자살 조장", checked: false },
    { id: "OTHER", label: "기타", checked: false },
  ];

  const [reasons, setReasons] = useState(initialReasons);
  const isSomeReasonSelected = reasons.some((reason) => reason.checked);
  const [otherDetail, setOtherDetail] = useState("");

  return (
    <>
      <SubHeader>게시글 신고</SubHeader>
      <Container>
        <h2 className="text-title-1 py-padding-y-m">
          신고 사유를 선택해주세요.
        </h2>
        <div className="py-padding-y-xs flex flex-col gap-gap-y-l">
          {reasons.map((reason) => (
            <CheckBox
              key={reason.id}
              checked={reason.checked}
              textSize="text-button-1"
              onCheck={() => {
                setReasons((prev) =>
                  prev.map((item) =>
                    item.id === reason.id
                      ? { ...item, checked: !item.checked }
                      : item,
                  ),
                );
              }}
              label={reason.label}
            />
          ))}
          {reasons.find((reason) => reason.id === "OTHER")?.checked && (
            <div>
              <textarea
                maxLength={200}
                value={otherDetail}
                onChange={(e) => setOtherDetail(e.target.value)}
                placeholder="신고 사유를 입력해주세요."
                className="h-[180px] w-full px-padding-x-xs py-padding-y-xs text-caption-m rounded-lg border border-border-base placeholder:text-text-disabled resize-none"
              ></textarea>
              <div className="text-caption-s mt-margin-y-xs">
                <span>{otherDetail.length}</span>
                <span className="text-text-disabled">/200자</span>
              </div>
            </div>
          )}
        </div>

        <BlockButton
          disabled={!isSomeReasonSelected}
          className="mt-padding-y-xxl"
        >
          완료
        </BlockButton>
      </Container>
    </>
  );
}
