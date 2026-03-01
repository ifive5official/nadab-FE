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

export function formatRelativeDate(dateString: string): string {
  const now = new Date();
  const targetDate = new Date(dateString);

  const diffInSeconds = Math.floor(
    (now.getTime() - targetDate.getTime()) / 1000,
  );
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);

  // 1. 1시간 미만: n분 전
  if (diffInMinutes < 60 && diffInMinutes >= 0) {
    if (diffInMinutes < 1) return "방금 전"; // 1분 미만일 때
    return `${diffInMinutes}분 전`;
  }

  // 2. 1일(24시간) 이내: n시간 전
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }

  // 3. 일주일 이내: n일 전
  if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  }

  // 4. 한 달(30일) 이내: n주 전
  if (diffInDays < 30) {
    return `${diffInWeeks}주 전`;
  }

  // 5. 그 이상: 0000년 00월 0일
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();

  return `${year}년 ${month}월 ${day}일`;
}
