// 마이페이지 계정 관리 섹션
import { Section, SectionItem } from "./AccountSectionComponents";
import { ChevronRightIcon } from "@/components/Icons";
import { Link } from "@tanstack/react-router";
import { useLogoutMutation } from "@/features/auth/hooks/useLogoutMutation";

export default function AccountSection() {
  const logoutMutation = useLogoutMutation();
  return (
    <Section title="계정 관리">
      <Link to="/account/password">
        <SectionItem
          title="비밀번호 변경"
          rightElement={<ChevronRightIcon />}
        />
      </Link>
      <SectionItem
        onClick={() => logoutMutation.mutate()}
        title="로그아웃"
        rightElement={<ChevronRightIcon />}
      />
      <SectionItem title="회원탈퇴" rightElement={<ChevronRightIcon />} />
    </Section>
  );
}
