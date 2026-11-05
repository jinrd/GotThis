import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";

// 이 아래 화면은 브라우저 저장소의 토큰을 확인한 뒤에만 그린다(서버에서 미리 그릴 내용이 없다).
// 그래서 즉시 이동(instant navigation) 검증 대상에서 뺀다.
export const instant = false;

export default function ListsLayout({ children }: LayoutProps<"/lists">) {
  // AppShell은 브라우저 저장소(토큰)와 주소(params)를 읽으므로 Suspense 경계 안에 둔다
  return (
    <Suspense>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
