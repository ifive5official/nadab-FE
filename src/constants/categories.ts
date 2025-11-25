import {
  BarChartSquareFilledIcon,
  CoffeeFilledIcon,
  HappyFilledIcon,
  UsersFilledIcon,
} from "@/components/Icons";

const categories = [
  {
    icon: BarChartSquareFilledIcon,
    title: "일과 성장",
  },
  {
    icon: HappyFilledIcon,
    title: "내면 탐색",
  },
  {
    icon: CoffeeFilledIcon,
    title: "일상의 균형",
  },
  {
    icon: UsersFilledIcon,
    title: "사람과 관계",
  },
] as const;

export default categories;
