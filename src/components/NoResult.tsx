/**
 * @description 결과 없음 컴포넌트(아이콘+제목+설명)
 * @page 검색 결과, 친구, 피드 글 등이 없을 때 사용
 */
import clsx from "clsx";
import { NoResultIcon } from "./Icons";

type Props = {
  className?: string;
  title: string;
  description: string;
};

export default function NoResult({ className, title, description }: Props) {
  return (
    <div
      className={clsx(
        "flex flex-col text-center items-center gap-gap-y-l",
        className,
      )}
    >
      <NoResultIcon className="p-3.5" />
      <p className="text-title-1 whitespace-pre-wrap">{title}</p>
      <p className="text-caption-m whitespace-pre-wrap">{description}</p>
    </div>
  );
}
