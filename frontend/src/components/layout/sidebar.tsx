"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Keyboard, LogOut, Plus, Settings, Trash2 } from "lucide-react";
import { taskListApi } from "@/lib/api/endpoints";
import type { TaskList } from "@/lib/api/types";
import { setToken } from "@/lib/api/client";
import { errorMessage } from "@/lib/errors";
import { queryKeys, useTaskLists } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { ColorDot } from "@/components/ui/color-picker";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Menu } from "@/components/ui/menu";
import { useToast } from "@/components/ui/toast";
import { ThemeSwitch } from "./theme-switch";

type SidebarProps = {
  onNewList: () => void;
  onShortcuts: () => void;
  onNavigate: () => void;
};

export function Sidebar({ onNewList, onShortcuts, onNavigate }: SidebarProps) {
  const router = useRouter();
  const params = useParams<{ listId?: string }>();
  const activeId = params.listId ? Number(params.listId) : null;
  const qc = useQueryClient();
  const toast = useToast();
  const { data: lists = [], isPending } = useTaskLists();
  const [deleting, setDeleting] = useState<TaskList | null>(null);

  const move = useMutation({
    mutationFn: ({ id, prevId, nextId }: { id: number; prevId: number | null; nextId: number | null }) =>
      taskListApi.move(id, { prevId, nextId }),
    onError: (err) => toast.error(errorMessage(err)),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.taskLists }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => taskListApi.remove(id),
    onSuccess: (_, id) => {
      toast.info("목록을 지웠어요.");
      setDeleting(null);
      qc.removeQueries({ queryKey: ["tasks", id] });
      if (id === activeId) router.replace("/lists");
    },
    onError: (err) => toast.error(errorMessage(err)),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.taskLists }),
  });

  // "위로" = 내 위의 위 항목과 바로 위 항목 사이에 놓기
  const moveBy = (index: number, delta: -1 | 1) => {
    const others = lists.filter((_, i) => i !== index);
    const target = index + delta;
    move.mutate({
      id: lists[index].id,
      prevId: others[target - 1]?.id ?? null,
      nextId: others[target]?.id ?? null,
    });
  };

  const logout = () => {
    setToken(null);
    qc.clear();
    router.replace("/login");
  };

  return (
    <nav aria-label="목록" className="flex h-full flex-col gap-4 p-4">
      <Link href="/lists" onClick={onNavigate} className="px-2 text-lg font-bold tracking-tight">
        StudyFlow
      </Link>

      <div className="flex min-h-0 flex-1 flex-col">
        <p className="px-2 pb-2 text-sm font-medium text-fg-muted">내 목록</p>
        <ul className="-mx-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto px-1">
          {isPending && <li className="px-2 py-2 text-sm text-fg-muted">불러오는 중…</li>}
          {lists.map((list, index) => {
            const active = list.id === activeId;
            return (
              <li key={list.id} className={`group flex items-center rounded-lg ${active ? "bg-subtle" : "hover:bg-subtle"}`}>
                <Link
                  href={`/lists/${list.id}`}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg px-2 text-base ${active ? "font-semibold" : ""}`}
                >
                  <ColorDot color={list.color} />
                  <span className="truncate">{list.name}</span>
                </Link>
                <Menu
                  label={`${list.name} 메뉴`}
                  items={[
                    {
                      label: "목록 설정",
                      icon: <Settings className="size-4" />,
                      onSelect: () => {
                        onNavigate();
                        router.push(`/lists/${list.id}?settings=basic`);
                      },
                    },
                    {
                      label: "위로 옮기기",
                      icon: <ArrowUp className="size-4" />,
                      disabled: index === 0,
                      onSelect: () => moveBy(index, -1),
                    },
                    {
                      label: "아래로 옮기기",
                      icon: <ArrowDown className="size-4" />,
                      disabled: index === lists.length - 1,
                      onSelect: () => moveBy(index, 1),
                    },
                    { separator: true },
                    {
                      label: "목록 지우기",
                      icon: <Trash2 className="size-4" />,
                      danger: true,
                      onSelect: () => setDeleting(list),
                    },
                  ]}
                />
              </li>
            );
          })}
        </ul>
        <Button variant="ghost" className="mt-2 justify-start px-2 text-fg-muted" onClick={onNewList}>
          <Plus className="size-5" aria-hidden />새 목록
        </Button>
      </div>

      <div className="space-y-2 border-t border-line pt-4">
        <ThemeSwitch />
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="flex-1 justify-start text-fg-muted" onClick={onShortcuts}>
            <Keyboard className="size-4" aria-hidden />
            단축키
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 justify-start text-fg-muted" onClick={logout}>
            <LogOut className="size-4" aria-hidden />
            로그아웃
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title="목록 지우기"
        description={
          <>
            <strong>{deleting?.name}</strong> 목록을 지울까요? 이 목록의 할 일, 상태, 필드가 모두 함께 지워져요.
          </>
        }
        confirmLabel="목록 지우기"
        pending={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </nav>
  );
}
