import { MainHeader } from "@/components/Headers";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { currentUserOptions } from "../user/quries";

export default function Home() {
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  return (
    <div>
      <MainHeader profileImgUrl={currentUser.profileImageUrl} />
      <p>홈</p>
      <Link to="/account">마이페이지로</Link>
    </div>
  );
}
