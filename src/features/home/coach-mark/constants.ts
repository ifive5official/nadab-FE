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

export const HOME_COACH_MARK_TARGETS = {
  questionText: '[data-coachmark="home-question-text"]',
  questionBadge: '[data-coachmark="home-question-badge"]',
  rerollQuestionButton: '[data-coachmark="home-reroll-question-button"]',
  profileButton: '[data-coachmark="home-profile-button"]',
  profileCrystalRow: '[data-coachmark="profile-crystal-row"]',
  profileMyPageRow: '[data-coachmark="profile-mypage-row"]',
  profileMenuBackdrop: '[data-coachmark="profile-menu-backdrop"]',
  reportTab: '[data-coachmark="home-report-tab"]',
  socialTab: '[data-coachmark="home-social-tab"]',
  calendarTab: '[data-coachmark="home-calendar-tab"]',
  writeButton: '[data-coachmark="home-write-button"]',
} as const;
