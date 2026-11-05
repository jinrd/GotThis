"use client";

import { useEffect, useState } from "react";
import { useIsMutating, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, ChevronDown, Loader2, Plus, Trash2, X } from "lucide-react";
import { tagApi } from "@/lib/api/endpoints";
import { priorities, type FieldDefinition, type Tag, type Task } from "@/lib/api/types";
import { defaultColor } from "@/lib/colors";
import { errorMessage } from "@/lib/errors";
import { readStorage, writeStorage } from "@/lib/storage";
import { isDone, priorityLabels, statusLabel } from "@/lib/tasks";
import { queryKeys, useSubtasks, useTask } from "@/hooks/queries";
import { Button, IconButton } from "@/components/ui/button";
import { ColorDot } from "@/components/ui/color-picker";
import { inputClass, Label, Select } from "@/components/ui/field";
import { Menu } from "@/components/ui/menu";
import { useToast } from "@/components/ui/toast";
import { AddTask } from "./add-task";
import { useListContext } from "./list-context";
import { PropertyInput } from "./property-input";
import { DoneCheckbox } from "./task-bits";

const moreKey = "sf.detail.more";

type TaskDetailProps = {
  taskId: number;
  fallback: Task | undefined;
  fields: FieldDefinition[];
  tags: Tag[];
  onClose: () => void;
};

export function TaskDetail({ taskId, fallback, fields, tags, onClose }: TaskDetailProps) {
  const { listId, statuses, actions, requestDelete } = useListContext();
  const { data, error } = useTask(listId, taskId);
  const task = data ?? fallback;
  const saving = useIsMutating({ mutationKey: ["task-save"] }) > 0;
  const [showMore, setShowMore] = useState(() => readStorage(moreKey) === "open");

  // Esc로 닫기 (입력 중이거나 다른 창이 열려 있을 때는 그쪽이 먼저 Esc를 받는다)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector("dialog[open], [role=menu]")) return;
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        target.blur();
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const toggleMore = () => {
    writeStorage(moreKey, showMore ? null : "open");
    setShowMore(!showMore);
  };

  return (
    <aside
      aria-label="할 일 상세"
      className="fixed inset-0 z-30 flex flex-col bg-surface lg:static lg:z-auto lg:w-[28rem] lg:shrink-0 lg:border-l lg:border-line"
    >
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <IconButton label="상세 닫기" onClick={onClose}>
          <ArrowLeft className="size-5 lg:hidden" aria-hidden />
          <X className="hidden size-5 lg:block" aria-hidden />
        </IconButton>
        <span className="flex-1 text-sm text-fg-muted" aria-live="polite">
          {saving ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              저장 중…
            </span>
          ) : task ? (
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-4 text-success" aria-hidden />
              자동 저장됨
            </span>
          ) : null}
        </span>
        {task && (
          <Menu
            label="할 일 메뉴"
            items={[
              { label: "지우기", icon: <Trash2 className="size-4" />, danger: true, onSelect: () => requestDelete(task) },
            ]}
          />
        )}
      </div>

      {!task ? (
        <div className="p-6 text-base text-fg-muted">
          {error ? errorMessage(error) : "불러오는 중…"}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="pt-2">
              <DoneCheckbox task={task} />
            </div>
            <TitleEditor key={task.id} task={task} onSave={(title) => actions.update.mutate({ taskId: task.id, body: { title } })} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="detail-status">상태</Label>
              <Select
                id="detail-status"
                value={task.statusId}
                onChange={(e) => actions.changeStatus.mutate({ task, statusId: Number(e.target.value) })}
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {statusLabel(s)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="detail-priority">중요도</Label>
              <Select
                id="detail-priority"
                value={task.priority}
                onChange={(e) =>
                  actions.update.mutate({ taskId: task.id, body: { priority: e.target.value as Task["priority"] } })
                }
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {priorityLabels[p]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="detail-due">마감일</Label>
              <div className="flex gap-2">
                <input
                  id="detail-due"
                  type="date"
                  value={task.dueDate ?? ""}
                  onChange={(e) =>
                    actions.update.mutate({
                      taskId: task.id,
                      body: e.target.value ? { dueDate: e.target.value } : { clearDueDate: true },
                    })
                  }
                  className={inputClass}
                />
                {task.dueDate && (
                  <Button onClick={() => actions.update.mutate({ taskId: task.id, body: { clearDueDate: true } })}>
                    지우기
                  </Button>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleMore}
            aria-expanded={showMore}
            className="mt-6 flex min-h-11 w-full items-center justify-between rounded-lg border border-line px-3 text-base font-medium hover:bg-subtle"
          >
            {showMore ? "간단히 보기" : "더 보기 (설명 · 태그 · 필드 · 하위 작업)"}
            <ChevronDown className={`size-5 text-fg-muted transition ${showMore ? "rotate-180" : ""}`} aria-hidden />
          </button>

          {showMore && (
            <div className="mt-6 space-y-8">
              <DescriptionEditor
                key={task.id}
                task={task}
                onSave={(description) => actions.update.mutate({ taskId: task.id, body: { description } })}
              />
              <TagSection task={task} tags={tags} />
              {fields.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-sm font-medium text-fg-muted">필드</h3>
                  {fields.map((field) => (
                    <div key={`${task.id}-${field.id}`}>
                      {field.type !== "CHECKBOX" && <Label htmlFor={`field-${field.id}`}>{field.name}</Label>}
                      <PropertyInput
                        field={field}
                        value={task.properties[String(field.id)]}
                        onSave={(value) =>
                          actions.updateProperties.mutate({ taskId: task.id, values: { [String(field.id)]: value } })
                        }
                      />
                    </div>
                  ))}
                </section>
              )}
              {task.parentId === null && <SubtaskSection task={task} />}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

function TitleEditor({ task, onSave }: { task: Task; onSave: (title: string) => void }) {
  const [draft, setDraft] = useState(task.title);
  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) setDraft(task.title);
    else if (trimmed !== task.title) onSave(trimmed);
  };
  return (
    <textarea
      value={draft}
      maxLength={200}
      rows={1}
      onChange={(e) => setDraft(e.target.value.replace(/\n/g, ""))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      aria-label="제목"
      className="field-sizing-content min-h-11 w-full resize-none rounded-lg px-2 py-1.5 text-xl font-semibold text-fg hover:bg-subtle focus:bg-subtle focus:outline-none"
    />
  );
}

function DescriptionEditor({ task, onSave }: { task: Task; onSave: (description: string) => void }) {
  const [draft, setDraft] = useState(task.description ?? "");
  return (
    <section>
      <Label htmlFor="detail-description">설명</Label>
      <textarea
        id="detail-description"
        value={draft}
        maxLength={2000}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== (task.description ?? "")) onSave(draft);
        }}
        placeholder="메모나 자세한 내용을 적어 두세요"
        className={`${inputClass} field-sizing-content min-h-24 py-2 leading-relaxed`}
      />
    </section>
  );
}

function TagSection({ task, tags }: { task: Task; tags: Tag[] }) {
  const { actions } = useListContext();
  const qc = useQueryClient();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const attached = new Set(task.tags.map((t) => t.id));

  // 새 태그를 만들고 바로 이 할 일에 붙인다
  const createTag = useMutation({
    mutationFn: (tagName: string) => tagApi.create({ name: tagName, color: defaultColor }),
    onSuccess: (tag) => {
      void qc.invalidateQueries({ queryKey: queryKeys.tags });
      actions.setTag.mutate({ taskId: task.id, tagId: tag.id, attached: true });
      setName("");
      setAdding(false);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <section>
      <h3 className="mb-2 text-sm font-medium text-fg-muted">태그</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const on = attached.has(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              aria-pressed={on}
              onClick={() => actions.setTag.mutate({ taskId: task.id, tagId: tag.id, attached: !on })}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm ${
                on ? "border-accent bg-accent-soft font-medium text-fg" : "border-line text-fg-muted hover:bg-subtle"
              }`}
            >
              {on ? <Check className="size-3.5" aria-hidden /> : <ColorDot color={tag.color} className="size-2.5" />}
              {tag.name}
            </button>
          );
        })}
        {adding ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) createTag.mutate(name.trim());
            }}
            className="flex gap-2"
          >
            <input
              autoFocus
              value={name}
              maxLength={30}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setAdding(false);
                }
              }}
              aria-label="새 태그 이름"
              placeholder="태그 이름"
              className={`${inputClass} min-h-9 w-36 text-sm`}
            />
            <Button type="submit" size="sm" variant="primary" disabled={createTag.isPending}>
              추가
            </Button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex min-h-9 items-center gap-1 rounded-full border border-dashed border-line-strong px-3 text-sm text-fg-muted hover:bg-subtle"
          >
            <Plus className="size-3.5" aria-hidden />새 태그
          </button>
        )}
      </div>
    </section>
  );
}

function SubtaskSection({ task }: { task: Task }) {
  const { listId, statuses, actions, requestDelete } = useListContext();
  const { data: subtasks = [] } = useSubtasks(listId, task.id);
  const [adding, setAdding] = useState(false);
  const doneCount = subtasks.filter((s) => isDone(s, statuses)).length;

  return (
    <section>
      <h3 className="mb-2 text-sm font-medium text-fg-muted">
        하위 작업 {subtasks.length > 0 && `${doneCount}/${subtasks.length}`}
      </h3>
      <ul className="divide-y divide-line rounded-xl border border-line">
        {subtasks.map((sub) => (
          <li key={sub.id} className="flex items-center gap-3 px-3 py-1.5">
            <DoneCheckbox task={sub} size="sm" />
            <SubtaskTitle
              key={sub.id}
              task={sub}
              done={isDone(sub, statuses)}
              onSave={(title) => actions.update.mutate({ taskId: sub.id, body: { title } })}
            />
            <IconButton label={`${sub.title} 지우기`} onClick={() => requestDelete(sub)}>
              <Trash2 className="size-4" aria-hidden />
            </IconButton>
          </li>
        ))}
        <li className="p-1">
          <AddTask
            parentId={task.id}
            statusId={statuses.find((s) => !s.done)?.id}
            active={adding}
            onActiveChange={setAdding}
            label="하위 작업 추가"
          />
        </li>
      </ul>
    </section>
  );
}

function SubtaskTitle({ task, done, onSave }: { task: Task; done: boolean; onSave: (title: string) => void }) {
  const [draft, setDraft] = useState(task.title);
  return (
    <input
      value={draft}
      maxLength={200}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const trimmed = draft.trim();
        if (!trimmed) setDraft(task.title);
        else if (trimmed !== task.title) onSave(trimmed);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.nativeEvent.isComposing) e.currentTarget.blur();
      }}
      aria-label="하위 작업 제목"
      className={`min-h-9 min-w-0 flex-1 rounded-md bg-transparent px-1 text-base hover:bg-subtle focus:bg-subtle focus:outline-none ${
        done ? "text-fg-muted line-through" : ""
      }`}
    />
  );
}
