"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ListTodo, Plus } from "lucide-react";
import { useTaskLists } from "@/hooks/queries";
import { readStorage, storageKeys } from "@/lib/storage";
import { errorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { ToggleOnlyHeader, useAppShell } from "@/components/layout/app-shell";

// /lists: 마지막으로 보던 목록으로 보내고, 목록이 하나도 없으면 첫 목록을 만들도록 안내한다
export function ListsHome() {
  const router = useRouter();
  const { openNewList } = useAppShell();
  const { data: lists, isPending, error } = useTaskLists();

  useEffect(() => {
    if (!lists?.length) return;
    const lastId = Number(readStorage(storageKeys.lastListId));
    const target = lists.find((l) => l.id === lastId) ?? lists[0];
    router.replace(`/lists/${target.id}`);
  }, [lists, router]);

  if (isPending || lists?.length) return null;

  return (
    <>
      <ToggleOnlyHeader>
        <span className="font-semibold">StudyFlow</span>
      </ToggleOnlyHeader>
      <div className="flex flex-1 items-center justify-center px-4">
        {error ? (
          <p role="alert" className="text-base text-danger">
            {errorMessage(error)}
          </p>
        ) : (
          <div className="max-w-sm text-center">
            <ListTodo className="mx-auto size-12 text-fg-muted" aria-hidden />
            <h1 className="mt-4 text-xl font-semibold">첫 목록을 만들어 보세요</h1>
            <p className="mt-2 text-base leading-relaxed text-fg-muted">
              목록은 할 일을 담는 공간이에요. &lsquo;회사 일&rsquo;, &lsquo;장보기&rsquo;처럼 주제별로 나눠 두면 편해요.
            </p>
            <Button variant="primary" className="mt-6" onClick={openNewList}>
              <Plus className="size-5" aria-hidden />첫 목록 만들기
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
