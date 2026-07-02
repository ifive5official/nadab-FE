import {
  COACH_MARK_MODAL_PLACEMENTS,
  type CoachMarkStep,
} from "@/store/coachMarkTourStore";

export const HOME_COACH_MARK_TOUR_ID = "home-question-topic-tour";

export const HOME_COACH_MARK_STEP_IDS = {
  step1Welcome: "step1-welcome",
  step2QuestionText: "step2-question-text",
  step3QuestionTopicBadge: "step3-question-topic-badge",
  step4SelectQuestionTopic: "step4-select-question-topic",
  step5ConfirmQuestionTopicChange: "step5-confirm-question-topic-change",
  step6ReviewChangedQuestion: "step6-review-changed-question",
  step7RerollQuestionButton: "step7-reroll-question-button",
  step8ProfileButton: "step8-profile-button",
  step9CrystalBalanceRow: "step9-crystal-balance-row",
  step10MyPageRow: "step10-mypage-row",
  step11ReportTab: "step11-report-tab",
  step12SocialTab: "step12-social-tab",
  step13CalendarTab: "step13-calendar-tab",
  step14WriteButton: "step14-write-button",
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
      {
        label: "좋아요.",
        action: "next",
      },
    ],
  },
  {
    id: HOME_COACH_MARK_STEP_IDS.step2QuestionText,
    target: '[data-coachmark="home-question-text"]',
    title: "오늘의 질문이에요.",
    description: "매일 새로운 질문이 도착해요. 오늘은 이 질문이에요.",
    buttons: [
      {
        label: "오늘 질문 확인했어요.",
        action: "next",
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
    buttons: [
      {
        label: "넘어가기",
        action: "goToStep",
        stepId: HOME_COACH_MARK_STEP_IDS.step7RerollQuestionButton,
        variant: "secondary",
      },
    ],
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
    modalPlacement: COACH_MARK_MODAL_PLACEMENTS.aboveBottomModal,
    allowBottomModalInteraction: true,
  },
  {
    id: HOME_COACH_MARK_STEP_IDS.step5ConfirmQuestionTopicChange,
    title: "확인 버튼을 누르면 주제 변경이 마무리돼요!",
    buttons: [],
    modalPlacement: COACH_MARK_MODAL_PLACEMENTS.aboveCenterModal,
    allowCenterModalInteraction: true,
    centerModalButtonActions: {
      cancel: "goToStep",
      cancelStepId: HOME_COACH_MARK_STEP_IDS.step7RerollQuestionButton,
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
        action: "next",
      },
    ],
    allowTargetInteraction: false,
  },
  {
    id: HOME_COACH_MARK_STEP_IDS.step7RerollQuestionButton,
    target: '[data-coachmark="home-reroll-question-button"]',
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
    buttons: [{ label: "확인했어요.", action: "next" }],
    allowTargetInteraction: false,
    highlightPadding: 0,
  },
  {
    id: HOME_COACH_MARK_STEP_IDS.step8ProfileButton,
    target: '[data-coachmark="home-profile-button"]',
    title: "프로필을 한 번 눌러봐요!",
    buttons: [],
    targetAction: "next",
    modalPlacement: COACH_MARK_MODAL_PLACEMENTS.center,
    allowTargetInteraction: true,
    highlightPadding: 0,
    highlightPulse: true,
  },
  {
    id: HOME_COACH_MARK_STEP_IDS.step9CrystalBalanceRow,
    target: '[data-coachmark="profile-crystal-row"]',
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
    buttons: [{ label: "빨리 모아볼래요.", action: "next" }],
    allowTargetInteraction: false,
    highlightPadding: 0,
  },
  {
    id: HOME_COACH_MARK_STEP_IDS.step10MyPageRow,
    target: '[data-coachmark="profile-mypage-row"]',
    title: "마이페이지에서 내게 꼭 맞는\n맞춤 환경 세팅을 할 수 있어요.",
    description: (
      <>
        화면테마, 프로필, 선택 주제와 알림 시간까지
        <br />
        나에게 꼭 맞게 설정할 수 있어요.
      </>
    ),
    buttons: [{ label: "알겠어요.", action: "next" }],
    onLeaveAction: {
      type: "click",
      target: '[data-coachmark="profile-menu-backdrop"]',
    },
    allowTargetInteraction: false,
    highlightPadding: 0,
  },
  {
    id: HOME_COACH_MARK_STEP_IDS.step11ReportTab,
    target: '[data-coachmark="home-report-tab"]',
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
    buttons: [{ label: "기대돼요!", action: "next" }],
    allowTargetInteraction: false,
    highlightPadding: 0,
  },
  {
    id: HOME_COACH_MARK_STEP_IDS.step12SocialTab,
    target: '[data-coachmark="home-social-tab"]',
    title: "친구들과 기록을 공유해요.",
    description: (
      <>
        <span className="font-bold">내 질문과 답변을 공유</span>하고,
        <br />
        <span className="font-bold">좋아요와 댓글</span>로 서로의 이야기에
        반응해봐요.
      </>
    ),
    buttons: [{ label: "해볼게요.", action: "next" }],
    allowTargetInteraction: false,
    highlightPadding: 0,
  },
  {
    id: HOME_COACH_MARK_STEP_IDS.step13CalendarTab,
    target: '[data-coachmark="home-calendar-tab"]',
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
    buttons: [{ label: "써볼게요.", action: "next" }],
    allowTargetInteraction: false,
    highlightPadding: 0,
  },
  {
    id: HOME_COACH_MARK_STEP_IDS.step14WriteButton,
    target: '[data-coachmark="home-write-button"]',
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
    buttons: [{ label: "확인했어요.", action: "next" }],
    allowTargetInteraction: true,
    highlightPulse: true,
    highlightPadding: 0,
    targetAction: "next",
  },
];
