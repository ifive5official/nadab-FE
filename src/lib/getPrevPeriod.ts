/**
 * 해당 날짜가 포함된 주의 월요일을 구합니다.
 */
function getMondayOfDate(date: Date): Date {
  const target = new Date(date);
  const day = target.getDay(); // 0(일) ~ 6(토)
  // 월요일(1) 기준 차이 계산 (일요일은 -6, 나머지는 1-day)
  const diff = (day === 0 ? -6 : 1) - day;
  target.setDate(target.getDate() + diff);
  target.setHours(0, 0, 0, 0);
  return target;
}

/**
 * 백엔드 Java 로직과 동일한 주차 계산
 * (그 주의 월요일이 속한 달의 첫 번째 월요일 기준)
 */
function getWeekOfMonth(date: Date): number {
  // 1. 해당 날짜가 속한 주의 월요일 찾기 (Java의 weekStart)
  const weekStart = getMondayOfDate(date);

  // 2. 해당 월의 1일 찾기
  const firstDayOfMonth = new Date(
    weekStart.getFullYear(),
    weekStart.getMonth(),
    1,
  );

  // 3. 해당 월의 '첫 번째 월요일' 찾기 (Java의 firstMondayOfMonth)
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysToFirstMonday = (1 - firstDayWeekday + 7) % 7;
  const firstMondayOfMonth = new Date(firstDayOfMonth);
  firstMondayOfMonth.setDate(firstDayOfMonth.getDate() + daysToFirstMonday);

  // 4. 두 날짜 사이의 주 차이 계산 (ChronoUnit.WEEKS.between + 1)
  const diffInMs = weekStart.getTime() - firstMondayOfMonth.getTime();
  const diffInWeeks = Math.floor(diffInMs / (7 * 24 * 60 * 60 * 1000));

  return diffInWeeks + 1;
}

/**
 * 주간/월간 리포트 텍스트 생성
 */
export function getPreviousPeriodText(
  reportType: "weekly" | "monthly",
  time: "prev" | "current",
) {
  // 주의: 백엔드는 KST 기준이므로, 한국 시간대 고려가 필요할 수 있음
  const now = new Date();

  if (reportType === "weekly") {
    const targetDate = new Date(now);
    // 저번 주(-7), 저저번 주(-14)
    const sub = time === "prev" ? 14 : 7;
    targetDate.setDate(now.getDate() - sub);

    // 백엔드 로직: '해당 주의 월요일'이 속한 달을 기준으로 함
    const monday = getMondayOfDate(targetDate);
    const month = monday.getMonth() + 1;
    const week = getWeekOfMonth(targetDate);

    return `${month}월 ${week}주차`;
  } else {
    const targetMonth = new Date(now);
    const sub = time === "prev" ? 2 : 1;
    targetMonth.setMonth(now.getMonth() - sub);

    return `${targetMonth.getMonth() + 1}월`;
  }
}
