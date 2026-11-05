"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api/client";

// 첫 화면: 로그인 여부에 따라 목록 화면이나 로그인 화면으로 보낸다
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(getToken() ? "/lists" : "/login");
  }, [router]);
  return null;
}
