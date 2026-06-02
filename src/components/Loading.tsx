/**
 * @description 데이터 로딩이 많은 메인 3개 페이지(리포트, 소셜, 캘린더) 전용 로딩 컴포넌트
 * @note 현재 홈에는 적용이 안되어 있는데 적용 고려
 */

import { LoadingIcon } from "./Icons";

export default function Loading() {
  return (
    <div className="flex-1 flex justify-center items-center">
      <LoadingIcon color="var(--color-icon-primary)" />
    </div>
  );
}
