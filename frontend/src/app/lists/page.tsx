import { ListsHome } from "@/components/lists/lists-home";

// 토큰 확인 뒤 브라우저에서만 그리는 화면이라 즉시 이동 검증에서 뺀다 (layout.tsx 참고)
export const instant = false;

export default function ListsPage() {
  return <ListsHome />;
}
