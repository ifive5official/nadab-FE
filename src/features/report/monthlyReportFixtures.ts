import type { components } from "@/generated/api-types";

type MonthlyReportLookup =
  components["schemas"]["MyMonthlyReportLookupResponseV2"];
type MonthlyReportLocator =
  components["schemas"]["MonthlyReportLocatorResponse"];
type MonthlyReportV1 = components["schemas"]["MonthlyReportResponse"];
type MonthlyReportV2 = components["schemas"]["MonthlyReportResponseV2"];
type MonthlyReportStart =
  components["schemas"]["MonthlyReportStartResponse"];

export type MonthlyReportFixtureScenario =
  | "empty"
  | "current-v1"
  | "current-v2"
  | "current-v1-previous-v1"
  | "current-v1-previous-v2"
  | "current-v2-previous-v1"
  | "current-v2-previous-v2";

export const monthlyReportFixtureScenarioOptions: {
  label: string;
  value: MonthlyReportFixtureScenario;
}[] = [
  { label: "없음", value: "empty" },
  { label: "현재 v1", value: "current-v1" },
  { label: "현재 v2", value: "current-v2" },
  { label: "v1 + 이전 v1", value: "current-v1-previous-v1" },
  { label: "v1 + 이전 v2", value: "current-v1-previous-v2" },
  { label: "v2 + 이전 v1", value: "current-v2-previous-v1" },
  { label: "v2 + 이전 v2", value: "current-v2-previous-v2" },
];

const STORAGE_KEY = "nadab:monthly-report-fixture";

const CURRENT_V1_ID = 9101;
const PREVIOUS_V1_ID = 9102;
const CURRENT_V2_ID = 9201;
const PREVIOUS_V2_ID = 9202;

const scenarios = new Set<MonthlyReportFixtureScenario>([
  "empty",
  "current-v1",
  "current-v2",
  "current-v1-previous-v1",
  "current-v1-previous-v2",
  "current-v2-previous-v1",
  "current-v2-previous-v2",
]);

export function getMonthlyReportFixtureScenario():
  | MonthlyReportFixtureScenario
  | null {
  if (import.meta.env.PROD || typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const scenarioParam = params.get("monthlyReportFixture");

  if (scenarioParam === "off") {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }

  if (isFixtureScenario(scenarioParam)) {
    window.localStorage.setItem(STORAGE_KEY, scenarioParam);
    return scenarioParam;
  }

  const storedScenario = window.localStorage.getItem(STORAGE_KEY);
  return isFixtureScenario(storedScenario) ? storedScenario : null;
}

export function isMonthlyReportFixtureEnabled() {
  return getMonthlyReportFixtureScenario() !== null;
}

export function setMonthlyReportFixtureScenario(
  scenario: MonthlyReportFixtureScenario,
) {
  if (import.meta.env.PROD || typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, scenario);
}

export function clearMonthlyReportFixtureScenario() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getMonthlyReportFixtureLookup(): MonthlyReportLookup | null {
  const scenario = getMonthlyReportFixtureScenario();
  if (!scenario) return null;

  switch (scenario) {
    case "empty":
      return {};
    case "current-v1":
      return { report: monthlyReportLocator(CURRENT_V1_ID, "1", 7) };
    case "current-v2":
      return { report: monthlyReportLocator(CURRENT_V2_ID, "2", 7) };
    case "current-v1-previous-v1":
      return {
        report: monthlyReportLocator(CURRENT_V1_ID, "1", 7),
        previousReport: monthlyReportLocator(PREVIOUS_V1_ID, "1", 6),
      };
    case "current-v1-previous-v2":
      return {
        report: monthlyReportLocator(CURRENT_V1_ID, "1", 7),
        previousReport: monthlyReportLocator(PREVIOUS_V2_ID, "2", 6),
      };
    case "current-v2-previous-v1":
      return {
        report: monthlyReportLocator(CURRENT_V2_ID, "2", 7),
        previousReport: monthlyReportLocator(PREVIOUS_V1_ID, "1", 6),
      };
    case "current-v2-previous-v2":
      return {
        report: monthlyReportLocator(CURRENT_V2_ID, "2", 7),
        previousReport: monthlyReportLocator(PREVIOUS_V2_ID, "2", 6),
      };
  }
}

export function getMonthlyReportV1Fixture(
  reportId: number,
): MonthlyReportV1 | null {
  if (!isMonthlyReportFixtureEnabled()) return null;
  return v1Fixtures[reportId] ?? null;
}

export function getMonthlyReportV2Fixture(
  reportId: number,
): MonthlyReportV2 | null {
  if (!isMonthlyReportFixtureEnabled()) return null;
  return v2Fixtures[reportId] ?? null;
}

export function startMonthlyReportV2Fixture(): MonthlyReportStart | null {
  if (!isMonthlyReportFixtureEnabled()) return null;

  setMonthlyReportFixtureScenario("current-v2");
  return {
    reportId: CURRENT_V2_ID,
    status: "COMPLETED",
    balanceAfter: 960,
  };
}

function isFixtureScenario(
  value: string | null,
): value is MonthlyReportFixtureScenario {
  return value !== null && scenarios.has(value as MonthlyReportFixtureScenario);
}

function monthlyReportLocator(
  reportId: number,
  version: "1" | "2",
  month: number,
): MonthlyReportLocator {
  return {
    reportId,
    version,
    month,
    status: "COMPLETED",
  };
}

function styledText(text: string): components["schemas"]["StyledText"] {
  return {
    segments: splitSentences(text).map((sentence, index) => ({
      text: sentence,
      marks: index % 2 === 0 ? ["BOLD"] : [],
    })),
  };
}

function splitSentences(text: string) {
  return text.split(/(?<=[.!?。！？])\s+/);
}

function v1Fixture(month: number, summary: string): MonthlyReportV1 {
  return {
    month,
    summary,
    discovered:
      "이번 달에는 작은 감정 변화를 놓치지 않고 기록하는 힘이 돋보였어요.",
    improve: "다음 달에는 충분한 휴식과 회복의 순간도 함께 남겨보면 좋아요.",
    status: "COMPLETED",
    content: {
      summary,
      discovered: styledText(
        "반복되는 일상 속에서도 스스로의 기분을 구체적으로 바라봤어요. 특히 관계와 일 사이에서 균형을 찾으려는 시도가 자주 보였어요.",
      ),
      improve: styledText(
        "조금 더 쉬어가도 괜찮아요. 해야 할 일을 끝낸 뒤에는 작은 보상도 함께 기록해보세요.",
      ),
    },
  };
}

const v1Fixtures: Record<number, MonthlyReportV1> = {
  [CURRENT_V1_ID]: v1Fixture(7, "익숙한 리듬 안에서 나다운 기준을 찾은 달"),
  [PREVIOUS_V1_ID]: v1Fixture(6, "천천히 회복하며 마음의 방향을 확인한 달"),
};

const currentEmotions: components["schemas"]["EmotionStat"][] = [
  { emotionCode: "JOY", emotionName: "기쁨", count: 18, percent: 32 },
  { emotionCode: "CALM", emotionName: "평온", count: 15, percent: 27 },
  { emotionCode: "EXPECTATION", emotionName: "기대", count: 10, percent: 18 },
  { emotionCode: "TIRED", emotionName: "피곤", count: 8, percent: 14 },
  { emotionCode: "ANXIETY", emotionName: "불안", count: 5, percent: 9 },
];

const previousEmotions: components["schemas"]["EmotionStat"][] = [
  { emotionCode: "CALM", emotionName: "평온", count: 16, percent: 34 },
  { emotionCode: "TIRED", emotionName: "피곤", count: 11, percent: 23 },
  { emotionCode: "JOY", emotionName: "기쁨", count: 9, percent: 19 },
  { emotionCode: "ANXIETY", emotionName: "불안", count: 7, percent: 15 },
  { emotionCode: "EXPECTATION", emotionName: "기대", count: 4, percent: 9 },
];

function v2Fixture(
  month: number,
  summary: string,
  comparisonType: "COMPARISON" | "BASELINE",
): MonthlyReportV2 {
  return {
    month,
    status: "COMPLETED",
    comparisonType,
    summary,
    imageUrl: "/periodic-report-bg.png",
    discovered: styledText(
      "이번 달의 기록에서는 관계 속에서 에너지를 얻는 순간과 혼자 정리하는 시간이 함께 나타났어요. 바쁜 일정 속에서도 감정을 구체적으로 적어둔 덕분에 나만의 회복 패턴이 선명해졌어요.",
    ),
    dominantKeyword: "평온",
    emotionTrend: "긍정 감정이 완만하게 늘었어요",
    emotionStats: {
      totalCount: 56,
      dominantEmotionCode: "JOY",
      positivePercent: 77,
      emotions: currentEmotions,
    },
    emotionComparison:
      comparisonType === "COMPARISON"
        ? {
            previousReportId: PREVIOUS_V2_ID,
            previousMonth: month - 1,
            positivePercentPointChange: 24,
            previousEmotionStats: {
              totalCount: 47,
              dominantEmotionCode: "CALM",
              positivePercent: 53,
              emotions: previousEmotions,
            },
          }
        : undefined,
    emotionSummaryContent: {
      styledText: styledText(
        "기쁨과 평온의 비중이 높아지면서 일상의 만족감이 더 자주 드러났어요. 피곤함도 있었지만 오래 머무르기보다 회복으로 이어지는 흐름이 보였어요.",
      ),
    },
    commentSummary: "이번 달의 나는 꽤 단단했어요.",
    comment: styledText(
      "할 일이 많은 날에도 마음을 끝까지 놓치지 않았어요. 누군가와 나눈 대화에서 힘을 얻었고, 혼자 있는 시간에는 다음 선택을 차분히 정리했어요. 이런 방식은 다음 달에도 좋은 기준이 될 거예요.",
    ),
    interestStats: {
      interests: [
        { interestCode: "RELATIONSHIP", interestName: "관계", count: 14 },
        { interestCode: "WORK", interestName: "일", count: 11 },
        { interestCode: "REST", interestName: "휴식", count: 8 },
        { interestCode: "GROWTH", interestName: "성장", count: 5 },
      ],
    },
    socialSummary: {
      visible: true,
      month,
      likeRanking: [
        { displayOrder: 1, userId: 1, nickname: "민지", topRank: true },
        { displayOrder: 2, userId: 2, nickname: "서준" },
        { displayOrder: 3, userId: 3, nickname: "하린" },
      ],
      commentRanking: [
        { displayOrder: 1, userId: 4, nickname: "도윤", topRank: true },
        { displayOrder: 2, userId: 5, nickname: "지우" },
        { displayOrder: 3, userId: 6, nickname: "유나" },
      ],
    },
  };
}

const v2Fixtures: Record<number, MonthlyReportV2> = {
  [CURRENT_V2_ID]: v2Fixture(
    7,
    "감정의 결이 또렷해지고 관계의 온도가 따뜻했던 달",
    "COMPARISON",
  ),
  [PREVIOUS_V2_ID]: v2Fixture(
    6,
    "회복의 속도를 찾고 일상의 균형을 되찾은 달",
    "BASELINE",
  ),
};
