"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Columns3, List as ListIcon, Plus, Settings } from "lucide-react";
import type { Task } from "@/lib/api/types";
import { errorMessage, hasErrorCode } from "@/lib/errors";
import { readStorage, storageKeys, writeStorage } from "@/lib/storage";
import { countSubtasks, groupByStatus } from "@/lib/tasks";
import { useFields, useStatuses, useTaskLists, useTags, useTasks } from "@/hooks/queries";
import { useShortcut } from "@/hooks/use-shortcut";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTaskActions } from "@/hooks/use-task-actions";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/field";
import { AddTask } from "@/components/tasks/add-task";
import { ColorDot } from "@/components/ui/color-picker";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { Hint } from "@/components/ui/hint";
import { SidebarToggle, ToggleOnlyHeader } from "@/components/layout/app-shell";
import { isSettingsTab, ListSettings, type SettingsTab } from "@/components/settings/list-settings";
import { countActive, emptyFilter, FilterBar, toTaskFilter, type FilterState } from "@/components/tasks/filter-bar";
import { ListContext, type ListContextValue } from "@/components/tasks/list-context";
import { TaskDetail } from "@/components/tasks/task-detail";
import { BoardView, ListView } from "@/components/tasks/task-views";

type View = "list" | "board";

export function ListScreen() {
  const params = useParams<{ listId: string }>();
  const listId = Number(params.listId);
  // 목록이 바뀌면 필터·입력 상태를 모두 처음으로 되돌리기 위해 key로 다시 만든다
  return <ListScreenInner key={listId} listId={listId} />;
}

function ListScreenInner({ listId }: { listId: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: lists, isPending: listsPending } = useTaskLists();
  const list = lists?.find((l) => l.id === listId);
  const statusesQuery = useStatuses(listId);
  const statuses = useMemo(() => statusesQuery.data ?? [], [statusesQuery.data]);
  const { data: fields = [] } = useFields(listId);
  const { data: tags = [] } = useTags();

  const [filter, setFilter] = useState<FilterState>(emptyFilter);
  const taskFilter = useMemo(() => toTaskFilter(filter), [filter]);
  const tasksQuery = useTasks(listId, taskFilter);
  const tasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data]);

  const [view, setView] = useState<View>(() => (readStorage(storageKeys.view(listId)) === "board" ? "board" : "list"));
  const [addingStatusId, setAddingStatusId] = useState<number | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddStatusId, setQuickAddStatusId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const narrow = useMediaQuery("(max-width: 1023px)");

  const actions = useTaskActions(listId, statuses);

  // 열린 할 일과 설정 탭은 주소에 둔다: 새로고침·뒤로 가기·링크 공유가 자연스럽게 된다
  const openTaskId = searchParams.get("task") ? Number(searchParams.get("task")) : null;
  const settingsParam = searchParams.get("settings");
  const settingsTab: SettingsTab | null = isSettingsTab(settingsParam) ? settingsParam : null;

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === null) next.delete(key);
      else next.set(key, value);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const openTask = useCallback((taskId: number) => setParam("task", String(taskId)), [setParam]);
  const closeTask = useCallback(() => setParam("task", null), [setParam]);

  useEffect(() => {
    if (list) writeStorage(storageKeys.lastListId, String(list.id));
  }, [list]);

  const changeView = (next: View) => {
    setView(next);
    writeStorage(storageKeys.view(listId), next);
  };

  const filterActive = countActive(filter) > 0;
  const groups = useMemo(() => groupByStatus(tasks, statuses), [tasks, statuses]);

  const contextValue = useMemo<ListContextValue>(
    () => ({
      listId,
      statuses,
      actions,
      subtaskCounts: countSubtasks(tasks, statuses),
      dragDisabled: filterActive,
      openTask,
      requestDelete: setDeleting,
    }),
    [listId, statuses, actions, tasks, filterActive, openTask],
  );

  useShortcut("n", () => setAddingStatusId(statuses.find((s) => !s.done)?.id ?? statuses[0]?.id ?? null), statuses.length > 0);
  useShortcut("/", () => searchRef.current?.focus());

  if (!listsPending && !list) {
    return (
      <div className="flex flex-1 flex-col">
        <ToggleOnlyHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-lg font-semibold">목록을 찾을 수 없어요</p>
          <p className="text-base text-fg-muted">이미 지워졌거나 주소가 잘못됐을 수 있어요.</p>
          <Link href="/lists" className="font-medium text-accent underline-offset-4 hover:underline">
            내 목록으로 가기
          </Link>
        </div>
      </div>
    );
  }

  const deleteSubtaskCount = deleting ? tasks.filter((t) => t.parentId === deleting.id).length : 0;
  const loadError = statusesQuery.error ?? tasksQuery.error;

  return (
    <ListContext.Provider value={contextValue}>
      <div className="flex min-h-0 flex-1">
        <div inert={openTaskId !== null && narrow} className="flex min-w-0 flex-1 flex-col">
          <header className="shrink-0 space-y-3 border-b border-line bg-surface px-4 py-3 md:px-6">
            <div className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-3 sm:flex">
              <SidebarToggle />
              <ColorDot color={list?.color ?? null} className="size-3.5" />
              <h1 className="min-w-0 flex-1 truncate text-xl font-bold" title={list?.name}>{list?.name ?? ""}</h1>
              <div role="radiogroup" aria-label="보기 방식" className="col-span-3 row-start-2 flex w-fit rounded-lg bg-subtle p-1">
                {(
                  [
                    ["list", "리스트", ListIcon],
                    ["board", "보드", Columns3],
                  ] as const
                ).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={view === value}
                    onClick={() => changeView(value)}
                    className={`flex min-h-11 items-center gap-2 rounded-md px-4 text-sm sm:min-h-9 sm:gap-1.5 sm:px-3 ${
                      view === value ? "bg-surface font-semibold text-fg shadow-sm" : "text-fg-muted hover:text-fg"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <Button variant="ghost" className="col-start-4 row-start-1 px-3" onClick={() => setParam("settings", "basic")} aria-label="목록 설정">
                <Settings className="size-5" aria-hidden />
                <span className="hidden md:inline">설정</span>
              </Button>
            </div>
            <FilterBar filter={filter} onChange={setFilter} statuses={statuses} tags={tags} searchRef={searchRef} />
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
            <div className="mx-auto w-full max-w-4xl shrink-0 space-y-2 px-4 pt-4 md:px-6 empty:hidden">
              {filterActive && (
                <p className="text-sm text-fg-muted" role="status">
                  필터를 쓰는 중에는 끌어서 순서를 바꿀 수 없어요. 상태는 ⋯ 메뉴로 옮길 수 있어요.
                </p>
              )}
              {view === "board" && !filterActive && (
                <Hint name="board">
                  카드를 끌어서 다른 열로 옮길 수 있어요. 끌기가 불편하면 카드의 ⋯ 메뉴를 쓰세요. 열은 &lsquo;설정 &gt; 상태&rsquo;에서 바꿀 수 있어요.
                </Hint>
              )}
              {view === "list" && tasks.length === 0 && !filterActive && tasksQuery.isSuccess && (
                <Hint name="first-task">
                  아래 &lsquo;+ 할 일 추가&rsquo;를 누르거나 <kbd className="font-semibold">N</kbd> 키를 눌러 첫 할 일을 적어 보세요.
                  동그라미를 누르면 완료돼요.
                </Hint>
              )}
            </div>

            {loadError ? (
              <p role="alert" className="px-6 py-10 text-center text-base text-danger">
                {hasErrorCode(loadError, "TASK_LIST_NOT_FOUND") ? "목록을 찾을 수 없어요." : errorMessage(loadError)}
              </p>
            ) : statusesQuery.isPending || tasksQuery.isPending ? (
              <p className="px-6 py-10 text-center text-base text-fg-muted">불러오는 중…</p>
            ) : view === "list" ? (
              <>
                {filterActive && tasks.length === 0 && (
                  <p className="px-6 pt-6 text-center text-base text-fg-muted">조건에 맞는 할 일이 없어요.</p>
                )}
                <ListView groups={groups} addingStatusId={addingStatusId} onAddingChange={setAddingStatusId} />
              </>
            ) : (
              <BoardView groups={groups} addingStatusId={addingStatusId} onAddingChange={setAddingStatusId} />
            )}
          </div>
          <div className="safe-bottom shrink-0 border-t border-line bg-surface px-4 pt-3 sm:hidden">
            <Button variant="primary" className="w-full" disabled={statuses.length === 0} onClick={() => setQuickAddOpen(true)}>
              <Plus className="size-5" aria-hidden />
              할 일 추가
            </Button>
          </div>
        </div>

        {openTaskId !== null && (
          <TaskDetail
            key={openTaskId}
            modal={narrow}
            taskId={openTaskId}
            fallback={tasks.find((t) => t.id === openTaskId)}
            fields={fields}
            tags={tags}
            onClose={closeTask}
            onManageTags={() => setParam("settings", "tags")}
          />
        )}
      </div>

      <Dialog open={quickAddOpen} onClose={() => setQuickAddOpen(false)} title="할 일 추가">
        <Label htmlFor="quick-add-status">추가할 상태</Label>
        <Select id="quick-add-status" value={quickAddStatusId ?? statuses.find((s) => !s.done)?.id ?? statuses[0]?.id ?? ""} onChange={(e) => setQuickAddStatusId(Number(e.target.value))}>
          {statuses.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}
        </Select>
        <div className="mt-3">
          <AddTask active={quickAddOpen} statusId={quickAddStatusId ?? statuses.find((s) => !s.done)?.id ?? statuses[0]?.id} onActiveChange={(active) => { if (!active) setQuickAddOpen(false); }} />
        </div>
      </Dialog>

      {list && (
        <ListSettings
          list={list}
          tab={settingsTab}
          onTabChange={(tab) => setParam("settings", tab)}
          onDeleted={() => router.replace("/lists")}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title={deleting?.parentId ? "하위 작업 지우기" : "할 일 지우기"}
        description={
          <>
            <strong>{deleting?.title}</strong>을(를) 지울까요?
            {deleteSubtaskCount > 0 && ` 하위 작업 ${deleteSubtaskCount}개도 함께 지워져요.`}
          </>
        }
        confirmLabel="지우기"
        pending={actions.remove.isPending}
        onConfirm={() => {
          if (!deleting) return;
          actions.remove.mutate(deleting, {
            onSuccess: () => {
              if (deleting.id === openTaskId) closeTask();
              setDeleting(null);
            },
          });
        }}
        onClose={() => setDeleting(null)}
      />
    </ListContext.Provider>
  );
}
