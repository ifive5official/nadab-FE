import BlockButton from "@/components/BlockButton";
import CheckBox from "@/components/Checkbox";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { useFlagMutation } from "@/features/social/hooks/useFlagMutation";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/flag/$reportId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { reportId } = Route.useParams();

  const initialReasons = [
    { id: "PROFANITY_HATE_SPEECH", label: "욕설 / 혐오 표현", checked: false },
    { id: "SEXUAL_CONTENT", label: "성적으로 부적절한 언행", checked: false },
    { id: "SELF_HARM", label: "자해 / 자살 조장", checked: false },
    { id: "OTHER", label: "기타", checked: false },
  ];

  const [reasons, setReasons] = useState(initialReasons);
  const selectedReason = reasons.find((reason) => reason.checked);
  const [otherDetail, setOtherDetail] = useState("");
  const canSubmit =
    selectedReason?.id === "OTHER" ? !!otherDetail : !!selectedReason;

  const navigate = useNavigate();
  const flagMutation = useFlagMutation({
    onSuccess: () => {
      navigate({ to: "/social", search: { tab: "feed" } });
    },
  });

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
                      : { ...item, checked: false },
                  ),
                );
              }}
              label={reason.label}
            />
          ))}
          {reasons.find((reason) => reason.id === "OTHER")?.checked && (
            <div className="flex flex-col">
              <textarea
                maxLength={200}
                value={otherDetail}
                onChange={(e) => setOtherDetail(e.target.value)}
                placeholder="신고 사유를 입력해주세요."
                className="h-[180px] w-full px-padding-x-xs py-padding-y-xs text-caption-m rounded-lg border border-border-base placeholder:text-text-disabled resize-none"
              ></textarea>
              <div className="ml-auto text-caption-s mt-margin-y-xs">
                <span>{otherDetail.length}</span>
                <span className="text-text-disabled">/200자</span>
              </div>
            </div>
          )}
        </div>

        <BlockButton
          onClick={() =>
            flagMutation.mutate({
              dailyReportId: Number(reportId),
              reason: selectedReason!.id,
              customReason: otherDetail,
            })
          }
          isLoading={flagMutation.isPending}
          disabled={!canSubmit}
          className="mt-padding-y-xxl"
        >
          완료
        </BlockButton>
      </Container>
    </>
  );
}
