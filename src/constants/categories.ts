import {
  Deco4FilledIcon,
  CoffeeFilledIcon,
  HappyFilledIcon,
  UsersFilledIcon,
  HeartFilledIcon,
  BookOpenedFilledIcon,
  // MoonFilledIcon,
} from "@/components/Icons";

const categories = [
  {
    icon: Deco4FilledIcon,
    code: "PREFERENCE",
    title: "취향",
    description: "내가 좋아하는 것, 끌리는 것들을 모아봐요.",
  },
  {
    icon: HappyFilledIcon,
    code: "EMOTION",
    title: "감정",
    description: "기쁨, 슬픔, 불안이 언제 찾아오는지 살펴봐요.",
  },
  {
    icon: CoffeeFilledIcon,
    code: "ROUTINE",
    title: "루틴",
    description: "나의 일상 규칙과 에너지에 대해 들여다봐요.",
  },
  {
    icon: UsersFilledIcon,
    code: "RELATIONSHIP",
    title: "관계",
    description: "누군가와 함께할 때 나는 어떤지 알아봐요.",
  },
  {
    icon: HeartFilledIcon,
    code: "LOVE",
    title: "사랑",
    description: "나의 사랑 방식을 알아가봐요.",
  },
  {
    icon: BookOpenedFilledIcon,
    code: "VALUES",
    title: "가치관",
    description: "선택의 순간, 무엇을 우선하는지 찾아봐요.",
  },
] as const;

export default categories;
