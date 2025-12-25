import { MainHeader } from "@/components/Headers";
import { useSuspenseQuery } from "@tanstack/react-query";
import { currentUserOptions } from "../user/quries";
import Tabs from "@/components/Tabs";
import QuestionSection from "./QuestionSection";
import RecordSection from "./RecordSection";

export default function Home() {
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);

  return (
    <div>
      <MainHeader profileImgUrl={currentUser.profileImageUrl} />
      <Tabs />
      <main className="flex flex-col gap-gap-y-xl">
        <QuestionSection />
        <RecordSection />
      </main>
    </div>
  );
}
