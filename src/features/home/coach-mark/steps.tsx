import { COACH_MARK_MODAL_PLACEMENTS } from "@/store/coachMarkTourStore";
import { HOME_COACH_MARK_STEP_IDS, HOME_COACH_MARK_TARGETS } from "./constants";
import {
  confirmTargetStep,
  emptyButtonModalStep,
  goToStepButton,
  nextButton,
  targetClickStep,
} from "./stepHelpers";
import type { HomeCoachMarkStep } from "./types";

export const HOME_COACH_MARK_STEPS: HomeCoachMarkStep[] = [
  {
    id: HOME_COACH_MARK_STEP_IDS.step1Welcome,
    title: "나답에 온 걸 환영해요",
    description: "나답을 100% 활용하기 위한 사용법을 먼저 알아볼까요?",
    buttons: [nextButton("좋아요.")],
  },
  confirmTargetStep({
    id: HOME_COACH_MARK_STEP_IDS.step2QuestionText,
    target: HOME_COACH_MARK_TARGETS.questionText,
    title: "오늘의 질문이에요.",
    description: "매일 새로운 질문이 도착해요. 오늘은 이 질문이에요.",
    buttonLabel: "오늘 질문 확인했어요.",
  }),
  {
    id: HOME_COACH_MARK_STEP_IDS.step3QuestionTopicBadge,
    target: HOME_COACH_MARK_TARGETS.questionBadge,
    title: "질문 주제를 언제든 바꿀 수 있어요.",
    description: (
      <>
        이 주제 말고도 5개의 주제가 더 있어요.
        <br />
        나중에 바꾸고 싶으면 언제든 여기서 바꾸면 돼요.
        <br />
        <span className="block font-bold pt-2 text-center">
          지금 탭해서 바꿔볼까요?
        </span>
      </>
    ),
    buttons: [
      goToStepButton(
        "넘어가기",
        HOME_COACH_MARK_STEP_IDS.step7RerollQuestionButton,
      ),
    ],
    targetNextStepId: HOME_COACH_MARK_STEP_IDS.step4SelectQuestionTopic,
    allowTargetInteraction: true,
    highlightPadding: 0,
    highlightPulse: true,
  },
  emptyButtonModalStep({
    id: HOME_COACH_MARK_STEP_IDS.step4SelectQuestionTopic,
    title: "더 궁금한 주제로 바꿔봐요.",
    description: (
      <>
        <span className="font-bold">각 주제마다&nbsp;</span>
        그에 맞는&nbsp;
        <span className="font-bold">다른 질문</span>
        이 와요.
        <br />
        오늘 쓰고 싶은 주제를 골라봐요.
      </>
    ),
    modalPlacement: COACH_MARK_MODAL_PLACEMENTS.aboveBottomModal,
    allowBottomModalInteraction: true,
  }),
  emptyButtonModalStep({
    id: HOME_COACH_MARK_STEP_IDS.step5ConfirmQuestionTopicChange,
    title: "확인 버튼을 누르면 주제 변경이 마무리돼요!",
    modalPlacement: COACH_MARK_MODAL_PLACEMENTS.aboveCenterModal,
    allowCenterModalInteraction: true,
    centerModalButtonActions: {
      cancel: "goToStep",
      cancelStepId: HOME_COACH_MARK_STEP_IDS.step7RerollQuestionButton,
      confirm: "next",
    },
  }),
  confirmTargetStep({
    id: HOME_COACH_MARK_STEP_IDS.step6ReviewChangedQuestion,
    target: HOME_COACH_MARK_TARGETS.questionText,
    title: "선택 주제 변경에 성공했어요.",
    description: (
      <>
        이제&nbsp;
        <span className="font-bold">
          새로운 주제에 대한 질문을 만나볼&nbsp;
        </span>
        수 있어요.
        <br />또 다른 주제로 답하고 싶어질 땐 다시 바꾸면 된답니다.
      </>
    ),
    buttonLabel: "이해했어요.",
  }),
  confirmTargetStep({
    id: HOME_COACH_MARK_STEP_IDS.step7RerollQuestionButton,
    target: HOME_COACH_MARK_TARGETS.rerollQuestionButton,
    title: "질문이 마음에 안 들면 바꿔요.",
    description: (
      <>
        오늘 질문이 나랑 안 맞는 것 같을 땐
        <br />
        새로운 질문 받기 버튼을 눌러봐요.
        <br />
        선택한 주제 내에서 하루 5번까지 바꿀 수 있어요.
      </>
    ),
    buttonLabel: "확인했어요.",
    highlightPadding: 0,
  }),
  targetClickStep({
    id: HOME_COACH_MARK_STEP_IDS.step8ProfileButton,
    target: HOME_COACH_MARK_TARGETS.profileButton,
    title: "프로필을 한 번 눌러봐요!",
    targetAction: "next",
    modalPlacement: COACH_MARK_MODAL_PLACEMENTS.center,
  }),
  confirmTargetStep({
    id: HOME_COACH_MARK_STEP_IDS.step9CrystalBalanceRow,
    target: HOME_COACH_MARK_TARGETS.profileCrystalRow,
    title: "기록을 작성해 크리스탈을 모으고\n리포트를 만들 때 크리스탈을 써요",
    description: (
      <>
        <span className="font-bold">기록 하나에 10개씩&nbsp;</span>
        모여요.
        <br />
        이렇게 모은 크리스탈은&nbsp;
        <span className="font-bold">리포트를 만들 때&nbsp;</span>쓸 수 있어요.
      </>
    ),
    buttonLabel: "빨리 모아볼래요.",
    highlightPadding: 0,
  }),
  confirmTargetStep({
    id: HOME_COACH_MARK_STEP_IDS.step10MyPageRow,
    target: HOME_COACH_MARK_TARGETS.profileMyPageRow,
    title: "마이페이지에서 내게 꼭 맞는\n맞춤 환경 세팅을 할 수 있어요.",
    description: (
      <>
        화면테마, 프로필, 선택 주제와 알림 시간까지
        <br />
        나에게 꼭 맞게 설정할 수 있어요.
      </>
    ),
    buttonLabel: "알겠어요.",
    onLeaveAction: {
      type: "click",
      target: HOME_COACH_MARK_TARGETS.profileMenuBackdrop,
    },
    highlightPadding: 0,
  }),
  confirmTargetStep({
    id: HOME_COACH_MARK_STEP_IDS.step11ReportTab,
    target: HOME_COACH_MARK_TARGETS.reportTab,
    title: "기록을 쌓아 리포트를 받아보세요.",
    description: (
      <>
        <span className="font-bold">
          기록이 이번 주에 3개, 이번 달에 15개, 통들어 30개&nbsp;
        </span>
        를 넘으면
        <br />
        각각&nbsp;
        <span className="font-bold">주간&middot;월간&middot;유형 리포트</span>를
        받을 수 있어요.
        <br />
        <span className="font-bold">받기 버튼을 눌러야 리포트가 생성</span>되니,
        <br />꼭 놓치지 말고 눌러서 다양한 나의 모습에 대해 알아보세요.
      </>
    ),
    buttonLabel: "기대돼요!",
    highlightPadding: 0,
    lightenCutout: true,
  }),
  confirmTargetStep({
    id: HOME_COACH_MARK_STEP_IDS.step12SocialTab,
    target: HOME_COACH_MARK_TARGETS.socialTab,
    title: "친구들과 기록을 공유해요.",
    description: (
      <>
        <span className="font-bold">내 질문과 답변을 공유</span>하고,
        <br />
        <span className="font-bold">좋아요와 댓글</span>로 서로의 이야기에
        반응해봐요.
      </>
    ),
    buttonLabel: "해볼게요.",
    highlightPadding: 0,
    lightenCutout: true,
  }),
  confirmTargetStep({
    id: HOME_COACH_MARK_STEP_IDS.step13CalendarTab,
    target: HOME_COACH_MARK_TARGETS.calendarTab,
    title: "언제든지 편하게 이전 기록을 되돌아봐요.",
    description: (
      <>
        <span className="font-bold">날짜를 클릭</span>해서 그날의 기록을&nbsp;
        <span className="font-bold">바로 확인</span>할 수 있고,
        <br />
        색상이나 키워드로 원하는&nbsp;
        <span className="font-bold">기록을 검색</span>할 수도 있어요.
      </>
    ),
    buttonLabel: "써볼게요.",
    highlightPadding: 0,
    lightenCutout: true,
  }),
  targetClickStep({
    id: HOME_COACH_MARK_STEP_IDS.step14WriteButton,
    target: HOME_COACH_MARK_TARGETS.writeButton,
    title: "첫 기록을 남겨봐요.",
    description: (
      <>
        길게 남기지 않아도 괜찮아요.
        <br />
        <span className="font-bold">
          질문에 대해 떠오르는 걸 가볍게 쓰는 걸로도 충분
        </span>
        해요.
        <br />
        답하기 어려운 질문이라면 다른 질문을 받아 답해봐요.
      </>
    ),
    targetAction: "next",
    button: nextButton("넘어가기", { variant: "secondary" }),
  }),
];
