import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { createFileRoute } from "@tanstack/react-router";
import FriendItem from "@/features/social/FriendItem";
import Modal from "@/components/Modal";
import { useState } from "react";
import { WarningFilledIcon } from "@/components/Icons";
import NoResult from "@/components/NoResult";
import InlineButton from "@/components/InlineButton";

export const Route = createFileRoute("/_authenticated/social/requests")({
  component: RouteComponent,
});

function RouteComponent() {
  const friendRequests = Array(2).fill(0); // 임시
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <SubHeader>친구 요청</SubHeader>
      <Container>
        {friendRequests.length > 0 ? (
          <ul className="pt-padding-y-m flex flex-col gap-margin-y-l">
            {friendRequests.map((_, i) => {
              return (
                <FriendItem
                  key={i}
                  name="알케르닉스"
                  profileImgUrl=""
                  buttons={[
                    <InlineButton
                      key={1}
                      variant="secondary"
                      onClick={() => setIsModalOpen(true)}
                    >
                      거절
                    </InlineButton>,
                    <InlineButton key={2} onClick={() => {}}>
                      수락
                    </InlineButton>,
                  ]}
                />
              );
            })}
          </ul>
        ) : (
          <NoResult
            title={`모든 친구 요청을\n수락했어요.`}
            description="검색을 통해 친구를 추가하고 기록을 나눠보세요."
            className="my-auto pb-header-height"
          />
        )}
      </Container>
      <Modal
        title={`알케르닉스님의 요청을 거절할까요?`}
        icon={WarningFilledIcon}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        buttons={[
          {
            label: "취소",
            onClick: () => setIsModalOpen(false),
          },
          {
            label: "확인",
            onClick: () => setIsModalOpen(false),
          },
        ]}
      >
        친구 요청 거절 이후에 복구가 불가능해요.
      </Modal>
    </>
  );
}
