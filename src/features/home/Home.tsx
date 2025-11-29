import { Link } from "@tanstack/react-router";

export default function Home() {
  return (
    <div>
      <p>홈</p>
      <Link to="/account">마이페이지로</Link>
    </div>
  );
}
