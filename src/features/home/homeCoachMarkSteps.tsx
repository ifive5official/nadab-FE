import type { CoachMarkStep } from "@/store/coachMarkTourStore";

export const HOME_COACH_MARK_TOUR_ID = "home-question-topic-tour";

export const HOME_COACH_MARK_STEP_IDS = {
  step1Welcome: "step1-welcome",
  step2QuestionText: "step2-question-text",
  step3QuestionTopicBadge: "step3-question-topic-badge",
  step4SelectQuestionTopic: "step4-select-question-topic",
  step5ConfirmQuestionTopicChange: "step5-confirm-question-topic-change",
  step6ReviewChangedQuestion: "step6-review-changed-question",
  step7RerollQuestionButton: "step7-reroll-question-button",
} as const;

export type HomeCoachMarkStepId =
  (typeof HOME_COACH_MARK_STEP_IDS)[keyof typeof HOME_COACH_MARK_STEP_IDS];

type HomeCoachMarkStep = CoachMarkStep & {
  id: HomeCoachMarkStepId;
  nextStepId?: HomeCoachMarkStepId;
  targetNextStepId?: HomeCoachMarkStepId;
  buttons?: NonNullable<CoachMarkStep["buttons"]> extends (infer Button)[]
    ? (Button & { stepId?: HomeCoachMarkStepId })[]
    : never;
};

export const HOME_COACH_MARK_STEPS: HomeCoachMarkStep[] = [
  {
    id: HOME_COACH_MARK_STEP_IDS.step1Welcome,
    title: "나답에 온 걸 환영해요",
    description: "나답을 100% 활용하기 위한 사용법을 먼저 알아볼까요?",
    buttons: [
      { label: "넘어가기", action: "finish" },
      {
        label: "좋아요.",
        action: "goToStep",
        stepId: HOME_COACH_MARK_STEP_IDS.step2QuestionText,
      },
    ],
  },
  {
    id: HOME_COACH_MARK_STEP_IDS.step2QuestionText,
    target: '[data-coachmark="home-question-text"]',
    title: "오늘의 질문이에요.",
    description: "매일 새로운 질문이 도착해요. 오늘은 이 질문이에요.",
    buttons: [
      { label: "넘어가기", action: "finish" },
      {
        label: "확인했어요.",
        action: "goToStep",
        stepId: HOME_COACH_MARK_STEP_IDS.step3QuestionTopicBadge,
      },
    ],
    allowTargetInteraction: false,
  },
  {
    id: HOME_COACH_MARK_STEP_IDS.step3QuestionTopicBadge,
    target: '[data-coachmark="home-question-badge"]',
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
    buttons: [{ label: "넘어가기", action: "finish", variant: "secondary" }],
    targetNextStepId: HOME_COACH_MARK_STEP_IDS.step4SelectQuestionTopic,
    allowTargetInteraction: true,
    highlightPadding: 0,
    highlightPulse: true,
  },
  {
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
    buttons: [],
    modalPlacement: "above-bottom-modal",
    allowBottomModalInteraction: true,
  },
  {
    id: HOME_COACH_MARK_STEP_IDS.step5ConfirmQuestionTopicChange,
    title: "확인 버튼을 누르면 주제 변경이 마무리돼요!",
    buttons: [],
    modalPlacement: "above-center-modal",
    allowCenterModalInteraction: true,
    centerModalButtonActions: {
      cancel: "finish",
      confirm: "next",
    },
  },
  {
    id: HOME_COACH_MARK_STEP_IDS.step6ReviewChangedQuestion,
    target: '[data-coachmark="home-question-text"]',
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
    buttons: [
      {
        label: "이해했어요.",
        action: "goToStep",
        stepId: HOME_COACH_MARK_STEP_IDS.step7RerollQuestionButton,
      },
    ],
    allowTargetInteraction: false,
  },
  {
    id: HOME_COACH_MARK_STEP_IDS.step7RerollQuestionButton,
    target: '[data-coachmark="home-reroll-question-button"]',
    title: "질문을 새로 받을 수 있어요.",
    description: "다른 질문이 필요할 때 새로운 질문 받기를 눌러보세요.",
    buttons: [{ label: "확인했어요.", action: "finish" }],
    allowTargetInteraction: false,
    highlightPadding: 0,
    highlightRadius: 9999,
  },
];
