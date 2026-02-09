// 오늘의 리포트 페이지와 상세보기 페이지에서
// 리포트 한 문장 당 띄우는 박스
export default function ReportMessage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="w-fit px-padding-x-s py-padding-y-m font-medium text-[13px]/[130%] text-text-secondary bg-surface-layer-1 rounded-2xl">
      {children}
    </p>
  );
}
