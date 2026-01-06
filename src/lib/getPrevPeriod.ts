/**
 * 해당 날짜가 그 달의 몇 주차인지 계산 (한국 기준: 1일이 포함된 주가 1주차)
 */
function getWeekOfMonth(date: Date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0(일) ~ 6(토)
  return Math.ceil((date.getDate() + firstDayWeekday) / 7);
}

/**
 * 주간/월간에 따른 이전 기간 텍스트 생성
 */
export function getPreviousPeriodText(reportType: "weekly" | "monthly") {
  const now = new Date();

  if (reportType === "weekly") {
    // 2주 전 날짜 계산
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 14);

    const month = lastWeek.getMonth() + 1;
    const week = getWeekOfMonth(lastWeek);
    return `${month}월 ${week}주차`;
  } else {
    // 2달 전 날짜 계산
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 2);

    const month = lastMonth.getMonth() + 1;
    return `${month}월`;
  }
}
