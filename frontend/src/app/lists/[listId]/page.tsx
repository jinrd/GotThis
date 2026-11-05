import { Suspense } from "react";
import { ListScreen } from "@/components/lists/list-screen";

// 토큰 확인 뒤 브라우저에서만 그리는 화면이라 즉시 이동 검증에서 뺀다 (layout.tsx 참고)
export const instant = false;

export default function ListPage() {
  // ListScreen은 주소의 listId와 쿼리(?task, ?settings)를 읽으므로 Suspense 경계 안에 둔다
  return (
    <Suspense>
      <ListScreen />
    </Suspense>
  );
}
