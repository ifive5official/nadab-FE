export function formatKoreanDate(date: Date) {
  const year = date.getFullYear() % 100;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

export function formatISODate(date: Date) {
  return date.toLocaleDateString("sv-SE", {
    timeZone: "Asia/Seoul",
  });
}
