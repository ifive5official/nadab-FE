import { MainHeader } from "@/components/Headers";
import { useSuspenseQuery } from "@tanstack/react-query";
import { currentUserOptions } from "../user/quries";
import Tabs from "@/components/Tabs";

export default function Home() {
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  return (
    <div>
      <MainHeader profileImgUrl={currentUser.profileImageUrl} />
      <Tabs />
      <p>홈</p>
    </div>
  );
}
