import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  // AuthForm이 주소의 쿼리(?expired)를 읽으므로 Suspense 경계 안에 둔다
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
