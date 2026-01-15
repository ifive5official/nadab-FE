import { getPreviousPeriodText } from "@/lib/getPrevPeriod";

export const REPORT_CONFIGS = {
  weekly: {
    label: "주간 분석",
    periodText: "주",
    key: "weekly-report",
    errKey: "WEEKLY_REPORT",
    requiredAnswers: 3,
    prevBtnText: `${getPreviousPeriodText("weekly")} 분석 보기`,
  },
  monthly: {
    label: "월간 분석",
    periodText: "달",
    key: "monthly-report",
    errKey: "MONTHLY_REPORT",
    requiredAnswers: 15,
    prevBtnText: `${getPreviousPeriodText("monthly")} 분석 보기`,
  },
} as const;
