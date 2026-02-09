export const REPORT_CONFIGS = {
  weekly: {
    label: "주간 리포트",
    cost: 20,
    periodText: "주",
    key: "weekly-report",
    errKey: "WEEKLY_REPORT",
    requiredAnswers: 3,
  },
  monthly: {
    label: "월간 리포트",
    cost: 40,
    periodText: "달",
    key: "monthly-report",
    errKey: "MONTHLY_REPORT",
    requiredAnswers: 15,
  },
} as const;
