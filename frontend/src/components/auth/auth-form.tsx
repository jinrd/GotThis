"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { authApi } from "@/lib/api/endpoints";
import { brand } from "@/lib/brand";
import { setToken } from "@/lib/api/client";
import { errorMessage } from "@/lib/errors";
import { BrandMark } from "@/components/ui/brand-mark";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("expired") ? "로그인이 만료됐어요. 다시 로그인해 주세요." : null,
  );
  const [pending, setPending] = useState(false);

  const isSignup = mode === "signup";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isSignup && password.length < 8) {
      setError("비밀번호는 8자 이상이어야 해요.");
      return;
    }
    setPending(true);
    try {
      if (isSignup) {
        await authApi.signup({ email, password, nickname });
      }
      // 가입이 끝나면 바로 로그인까지 해서 한 번에 시작할 수 있게 한다
      const { accessToken } = await authApi.login({ email, password });
      setToken(accessToken);
      router.replace("/lists");
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <BrandMark size={48} />
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight">{brand.name}</p>
          <p className="mt-1 text-sm font-medium text-accent">{brand.tagline}</p>
          <h1 className="mt-2 text-base text-fg-muted">
            {isSignup ? "계정을 만들고 바로 시작해 보세요" : "다시 오신 걸 환영해요"}
          </h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-sm" noValidate>
          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              {error}
            </div>
          )}
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          {isSignup && (
            <div>
              <Label htmlFor="nickname">이름</Label>
              <Input
                id="nickname"
                autoComplete="nickname"
                required
                maxLength={30}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="화면에 보일 이름"
              />
            </div>
          )}
          <div>
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={isSignup ? 8 : undefined}
              maxLength={64}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby={isSignup ? "password-help" : undefined}
            />
            {isSignup && (
              <p id="password-help" className="mt-1.5 text-sm text-fg-muted">
                8자 이상으로 정해 주세요.
              </p>
            )}
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={pending}>
            {pending ? "잠시만요…" : isSignup ? "가입하고 시작하기" : "로그인"}
          </Button>
        </form>

        <p className="mt-6 text-center text-base text-fg-muted">
          {isSignup ? "이미 계정이 있나요? " : "처음이신가요? "}
          <Link href={isSignup ? "/login" : "/signup"} className="font-medium text-accent underline-offset-4 hover:underline">
            {isSignup ? "로그인" : "계정 만들기"}
          </Link>
        </p>
      </div>
    </main>
  );
}
