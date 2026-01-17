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
// 주간 레포트인지 월간 레포트인지 / 이전(저저번주)레포트인지 이번(저번주)레포트인지
export function getPreviousPeriodText(
  reportType: "weekly" | "monthly",
  time: "prev" | "current"
) {
  const now = new Date();

  if (reportType === "weekly") {
    const lastWeek = new Date(now);
    const sub = time === "prev" ? 14 : 7;
    lastWeek.setDate(now.getDate() - sub);

    const month = lastWeek.getMonth() + 1;
    const week = getWeekOfMonth(lastWeek);
    return `${month}월 ${week}주차`;
  } else {
    const lastMonth = new Date(now);
    const sub = time === "prev" ? 2 : 1;
    lastMonth.setMonth(now.getMonth() - sub);

    const month = lastMonth.getMonth() + 1;
    return `${month}월`;
  }
}
