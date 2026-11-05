"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, CircleCheck, Pencil, Plus, Trash2 } from "lucide-react";
import { fieldApi, statusApi, tagApi, taskListApi } from "@/lib/api/endpoints";
import { fieldTypes, type FieldDefinition, type FieldType, type Status, type Tag, type TaskList } from "@/lib/api/types";
import { defaultColor } from "@/lib/colors";
import { errorMessage } from "@/lib/errors";
import { invalidateTasks, queryKeys, useFields, useStatuses, useTags, useTasks } from "@/hooks/queries";
import { Button, IconButton } from "@/components/ui/button";
import { ColorDot, ColorPicker } from "@/components/ui/color-picker";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { Input, inputClass, Label, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

export const settingsTabs = {
  basic: "기본",
  statuses: "상태",
  fields: "필드",
  tags: "태그",
} as const;

export type SettingsTab = keyof typeof settingsTabs;

export function isSettingsTab(value: string | null): value is SettingsTab {
  return value !== null && value in settingsTabs;
}

type ListSettingsProps = {
  list: TaskList;
  tab: SettingsTab | null;
  onTabChange: (tab: SettingsTab | null) => void;
  onDeleted: () => void;
};

export function ListSettings({ list, tab, onTabChange, onDeleted }: ListSettingsProps) {
  return (
    <Dialog open={tab !== null} onClose={() => onTabChange(null)} title={`${list.name} 설정`} size="lg">
      <div role="tablist" aria-label="설정 항목" className="mb-5 grid grid-cols-4 gap-1 rounded-lg bg-subtle p-1">
        {(Object.keys(settingsTabs) as SettingsTab[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => onTabChange(key)}
            className={`min-h-11 rounded-md text-base sm:min-h-10 ${
              tab === key ? "bg-surface font-semibold text-fg shadow-sm" : "text-fg-muted hover:text-fg"
            }`}
          >
            {settingsTabs[key]}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-label={tab ? settingsTabs[tab] : undefined}>
        {tab === "basic" && <BasicTab key={list.id} list={list} onDeleted={onDeleted} />}
        {tab === "statuses" && <StatusTab listId={list.id} />}
        {tab === "fields" && <FieldTab listId={list.id} />}
        {tab === "tags" && <TagTab />}
      </div>
    </Dialog>
  );
}

function Help({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-sm leading-relaxed text-fg-muted">{children}</p>;
}

// 입력칸을 벗어나면 저장하는 이름 편집기 (설정의 모든 이름 칸이 같은 방식)
function NameInput({ value, label, maxLength, onSave }: {
  value: string;
  label: string;
  maxLength: number;
  onSave: (name: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <input
      value={draft}
      maxLength={maxLength}
      aria-label={label}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const trimmed = draft.trim();
        if (!trimmed) setDraft(value);
        else if (trimmed !== value) onSave(trimmed);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.nativeEvent.isComposing) e.currentTarget.blur();
      }}
      className={`${inputClass} min-h-10`}
    />
  );
}

/* ---------- 기본 ---------- */

function BasicTab({ list, onDeleted }: { list: TaskList; onDeleted: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [name, setName] = useState(list.name);
  const [color, setColor] = useState(list.color ?? defaultColor);
  const [confirming, setConfirming] = useState(false);

  const save = useMutation({
    mutationFn: () => taskListApi.update(list.id, { name: name.trim(), color }),
    onSuccess: () => {
      toast.info("저장했어요.");
      void qc.invalidateQueries({ queryKey: queryKeys.taskLists });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: () => taskListApi.remove(list.id),
    onSuccess: () => {
      toast.info("목록을 지웠어요.");
      setConfirming(false);
      void qc.invalidateQueries({ queryKey: queryKeys.taskLists });
      onDeleted();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const changed = name.trim() !== list.name || color !== list.color;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) save.mutate();
  };

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <Label htmlFor="list-name">이름</Label>
          <Input id="list-name" value={name} maxLength={50} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-fg-muted">색상</p>
          <ColorPicker label="목록 색상" value={color} onChange={setColor} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={!changed || !name.trim() || save.isPending}>
            저장
          </Button>
        </div>
      </form>
      <div className="mt-8 rounded-xl border border-danger/40 p-4">
        <p className="font-medium">목록 지우기</p>
        <p className="mt-1 text-sm text-fg-muted">이 목록의 할 일, 상태, 필드가 모두 함께 지워져요.</p>
        <Button variant="secondary" className="mt-3 text-danger" onClick={() => setConfirming(true)}>
          <Trash2 className="size-4" aria-hidden />
          목록 지우기
        </Button>
      </div>
      <ConfirmDialog
        open={confirming}
        title="목록 지우기"
        description={
          <>
            <strong>{list.name}</strong> 목록을 지울까요? 이 목록의 할 일, 상태, 필드가 모두 함께 지워져요.
          </>
        }
        confirmLabel="목록 지우기"
        pending={remove.isPending}
        onConfirm={() => remove.mutate()}
        onClose={() => setConfirming(false)}
      />
    </>
  );
}

/* ---------- 상태 ---------- */

function StatusTab({ listId }: { listId: number }) {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: statuses = [] } = useStatuses(listId);
  // 상태별 할 일 수 (하위 작업 포함). 할 일이 남은 상태는 서버가 지우기를 거부한다.
  const { data: allTasks = [] } = useTasks(listId, {});
  const [newName, setNewName] = useState("");
  const [deleting, setDeleting] = useState<Status | null>(null);

  const countOf = (statusId: number) => allTasks.filter((t) => t.statusId === statusId).length;

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.statuses(listId) });
    void invalidateTasks(qc, listId);
  };
  const onError = (err: unknown) => {
    toast.error(errorMessage(err));
    refresh();
  };

  const create = useMutation({
    mutationFn: (name: string) => statusApi.create(listId, { name }),
    onSuccess: () => {
      setNewName("");
      refresh();
    },
    onError,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: number; body: { name?: string; done?: boolean } }) =>
      statusApi.update(listId, id, body),
    onSuccess: refresh,
    onError,
  });
  const move = useMutation({
    mutationFn: ({ id, prevId, nextId }: { id: number; prevId: number | null; nextId: number | null }) =>
      statusApi.move(listId, id, { prevId, nextId }),
    onSuccess: refresh,
    onError,
  });
  const remove = useMutation({
    mutationFn: (id: number) => statusApi.remove(listId, id),
    onSuccess: () => {
      setDeleting(null);
      refresh();
    },
    onError: (err) => {
      setDeleting(null);
      onError(err);
    },
  });

  const moveBy = (index: number, delta: -1 | 1) => {
    const others = statuses.filter((_, i) => i !== index);
    const target = index + delta;
    move.mutate({ id: statuses[index].id, prevId: others[target - 1]?.id ?? null, nextId: others[target]?.id ?? null });
  };

  return (
    <>
      <Help>
        상태는 할 일이 거치는 단계예요. 보드에서는 상태 하나가 열 하나가 돼요. &lsquo;완료&rsquo;로 표시한 상태에 들어간
        할 일은 체크된 것으로 보여요.
      </Help>
      <ul className="space-y-2">
        {statuses.map((status, index) => {
          const count = countOf(status.id);
          return (
            <li key={status.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-line p-2">
              <div className="min-w-40 flex-1">
                <NameInput
                  key={status.name}
                  value={status.name}
                  label="상태 이름"
                  maxLength={30}
                  onSave={(name) => update.mutate({ id: status.id, body: { name } })}
                />
              </div>
              <label className="flex min-h-10 items-center gap-2 px-1 text-sm">
                <input
                  type="checkbox"
                  checked={status.done}
                  onChange={(e) => update.mutate({ id: status.id, body: { done: e.target.checked } })}
                  className="size-5 accent-[var(--accent)]"
                />
                <CircleCheck className="size-4 text-success" aria-hidden />
                완료
              </label>
              <span className="w-14 text-right text-sm text-fg-muted">{count}개</span>
              <IconButton label={`${status.name} 앞으로`} disabled={index === 0} onClick={() => moveBy(index, -1)}>
                <ArrowUp className="size-4" aria-hidden />
              </IconButton>
              <IconButton
                label={`${status.name} 뒤로`}
                disabled={index === statuses.length - 1}
                onClick={() => moveBy(index, 1)}
              >
                <ArrowDown className="size-4" aria-hidden />
              </IconButton>
              <IconButton
                label={
                  statuses.length === 1
                    ? "상태가 하나뿐이라 지울 수 없어요"
                    : count > 0
                      ? `할 일 ${count}개가 남아 있어 지울 수 없어요`
                      : `${status.name} 지우기`
                }
                disabled={statuses.length === 1 || count > 0}
                onClick={() => setDeleting(status)}
              >
                <Trash2 className="size-4" aria-hidden />
              </IconButton>
            </li>
          );
        })}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newName.trim()) create.mutate(newName.trim());
        }}
        className="mt-4 flex gap-2"
      >
        <Input value={newName} maxLength={30} onChange={(e) => setNewName(e.target.value)} placeholder="새 상태 이름 (예: 보류)" aria-label="새 상태 이름" />
        <Button type="submit" variant="primary" disabled={!newName.trim() || create.isPending}>
          <Plus className="size-4" aria-hidden />
          추가
        </Button>
      </form>
      <p className="mt-3 text-sm text-fg-muted">할 일이 남아 있는 상태는 지울 수 없어요. 할 일을 다른 상태로 먼저 옮겨 주세요.</p>
      <ConfirmDialog
        open={deleting !== null}
        title="상태 지우기"
        description={<><strong>{deleting?.name}</strong> 상태를 지울까요?</>}
        confirmLabel="상태 지우기"
        pending={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

/* ---------- 필드 ---------- */

const fieldTypeLabels: Record<FieldType, string> = {
  TEXT: "글자",
  NUMBER: "숫자",
  DATE: "날짜",
  CHECKBOX: "체크박스",
  SELECT: "선택지",
};

function parseOptions(text: string): string[] {
  return [...new Set(text.split("\n").map((o) => o.trim()).filter(Boolean))];
}

function FieldTab({ listId }: { listId: number }) {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: fields = [] } = useFields(listId);
  const [name, setName] = useState("");
  const [type, setType] = useState<FieldType>("TEXT");
  const [optionsText, setOptionsText] = useState("");
  const [editingOptions, setEditingOptions] = useState<FieldDefinition | null>(null);
  const [deleting, setDeleting] = useState<FieldDefinition | null>(null);

  // 필드를 지우거나 선택지를 줄이면 서버가 할 일의 값도 함께 지우므로 할 일 목록도 다시 받는다
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.fields(listId) });
    void invalidateTasks(qc, listId);
    void qc.invalidateQueries({ queryKey: ["task", listId] });
  };
  const onError = (err: unknown) => toast.error(errorMessage(err));

  const create = useMutation({
    mutationFn: () =>
      fieldApi.create(listId, {
        name: name.trim(),
        type,
        options: type === "SELECT" ? parseOptions(optionsText) : undefined,
      }),
    onSuccess: () => {
      setName("");
      setOptionsText("");
      refresh();
    },
    onError,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: number; body: { name?: string; options?: string[] } }) =>
      fieldApi.update(listId, id, body),
    onSuccess: () => {
      setEditingOptions(null);
      refresh();
    },
    onError,
  });
  const remove = useMutation({
    mutationFn: (id: number) => fieldApi.remove(listId, id),
    onSuccess: () => {
      setDeleting(null);
      refresh();
    },
    onError,
  });

  const onCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (type === "SELECT" && parseOptions(optionsText).length === 0) {
      toast.error("선택지를 한 개 이상 적어 주세요.");
      return;
    }
    create.mutate();
  };

  return (
    <>
      <Help>
        필드는 이 목록의 할 일에 붙이는 나만의 항목이에요. 예: &lsquo;예상 시간(숫자)&rsquo;, &lsquo;담당(선택지)&rsquo;.
        할 일 상세의 &lsquo;더 보기&rsquo;에서 값을 적을 수 있어요.
      </Help>
      {fields.length > 0 && (
        <ul className="mb-6 space-y-2">
          {fields.map((field) => (
            <li key={field.id} className="rounded-xl border border-line p-2">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <NameInput
                    key={field.name}
                    value={field.name}
                    label="필드 이름"
                    maxLength={50}
                    onSave={(n) => update.mutate({ id: field.id, body: { name: n } })}
                  />
                </div>
                <span className="w-16 text-center text-sm text-fg-muted">{fieldTypeLabels[field.type]}</span>
                {field.type === "SELECT" && (
                  <IconButton label={`${field.name} 선택지 바꾸기`} onClick={() => setEditingOptions(field)}>
                    <Pencil className="size-4" aria-hidden />
                  </IconButton>
                )}
                <IconButton label={`${field.name} 지우기`} onClick={() => setDeleting(field)}>
                  <Trash2 className="size-4" aria-hidden />
                </IconButton>
              </div>
              {field.type === "SELECT" && (
                <p className="mt-1.5 px-1 text-sm text-fg-muted">선택지: {field.options.join(", ")}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onCreate} className="space-y-3 rounded-xl bg-subtle p-4">
        <p className="font-medium">새 필드</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_10rem]">
          <Input value={name} maxLength={50} onChange={(e) => setName(e.target.value)} placeholder="필드 이름" aria-label="새 필드 이름" />
          <Select value={type} onChange={(e) => setType(e.target.value as FieldType)} aria-label="새 필드 종류">
            {fieldTypes.map((t) => (
              <option key={t} value={t}>
                {fieldTypeLabels[t]}
              </option>
            ))}
          </Select>
        </div>
        {type === "SELECT" && (
          <textarea
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            rows={3}
            placeholder={"선택지를 한 줄에 하나씩\n예: 나\n동료"}
            aria-label="선택지"
            className={`${inputClass} py-2`}
          />
        )}
        <p className="text-sm text-fg-muted">종류는 만든 뒤에 바꿀 수 없어요.</p>
        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={!name.trim() || create.isPending}>
            <Plus className="size-4" aria-hidden />
            필드 추가
          </Button>
        </div>
      </form>

      {editingOptions && (
        <OptionsEditor
          key={editingOptions.id}
          field={editingOptions}
          pending={update.isPending}
          onSave={(options) => update.mutate({ id: editingOptions.id, body: { options } })}
          onClose={() => setEditingOptions(null)}
        />
      )}
      <ConfirmDialog
        open={deleting !== null}
        title="필드 지우기"
        description={
          <>
            <strong>{deleting?.name}</strong> 필드를 지울까요? 모든 할 일에서 이 필드에 적은 값도 함께 지워져요.
          </>
        }
        confirmLabel="필드 지우기"
        pending={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

function OptionsEditor({ field, pending, onSave, onClose }: {
  field: FieldDefinition;
  pending: boolean;
  onSave: (options: string[]) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(field.options.join("\n"));
  const options = parseOptions(text);
  const removed = field.options.filter((o) => !options.includes(o));

  return (
    <Dialog open onClose={onClose} title={`${field.name} 선택지`}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        aria-label="선택지 (한 줄에 하나)"
        className={`${inputClass} py-2`}
      />
      <p className="mt-2 text-sm text-fg-muted">한 줄에 하나씩 적어 주세요.</p>
      {removed.length > 0 && (
        <p className="mt-2 text-sm text-danger">
          빠진 선택지({removed.join(", ")})를 고른 할 일에서는 그 값이 지워져요.
        </p>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <Button onClick={onClose}>취소</Button>
        <Button variant="primary" disabled={options.length === 0 || pending} onClick={() => onSave(options)}>
          저장
        </Button>
      </div>
    </Dialog>
  );
}

/* ---------- 태그 ---------- */

function TagTab() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: tags = [] } = useTags();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(defaultColor);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [deleting, setDeleting] = useState<Tag | null>(null);

  // 태그 이름·색은 모든 목록의 할 일 응답에 들어 있으므로 할 일 캐시도 전부 새로 받는다
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.tags });
    void qc.invalidateQueries({ queryKey: ["tasks"] });
    void qc.invalidateQueries({ queryKey: ["task"] });
  };
  const onError = (err: unknown) => toast.error(errorMessage(err));

  const create = useMutation({
    mutationFn: () => tagApi.create({ name: name.trim(), color }),
    onSuccess: () => {
      setName("");
      refresh();
    },
    onError,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: number; body: { name?: string; color?: string } }) => tagApi.update(id, body),
    onSuccess: () => {
      setEditing(null);
      refresh();
    },
    onError,
  });
  const remove = useMutation({
    mutationFn: (id: number) => tagApi.remove(id),
    onSuccess: () => {
      setDeleting(null);
      refresh();
    },
    onError,
  });

  return (
    <>
      <Help>태그는 모든 목록에서 함께 써요. 여기서 바꾸면 모든 목록의 할 일에 반영돼요.</Help>
      {tags.length > 0 ? (
        <ul className="mb-6 divide-y divide-line rounded-xl border border-line">
          {tags.map((tag) => (
            <li key={tag.id} className="flex items-center gap-3 px-3 py-1.5">
              <ColorDot color={tag.color} />
              <span className="flex-1 text-base">{tag.name}</span>
              <IconButton label={`${tag.name} 바꾸기`} onClick={() => setEditing(tag)}>
                <Pencil className="size-4" aria-hidden />
              </IconButton>
              <IconButton label={`${tag.name} 지우기`} onClick={() => setDeleting(tag)}>
                <Trash2 className="size-4" aria-hidden />
              </IconButton>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-6 text-base text-fg-muted">아직 태그가 없어요.</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) create.mutate();
        }}
        className="space-y-3 rounded-xl bg-subtle p-4"
      >
        <p className="font-medium">새 태그</p>
        <Input value={name} maxLength={30} onChange={(e) => setName(e.target.value)} placeholder="태그 이름 (예: 급함)" aria-label="새 태그 이름" />
        <ColorPicker label="새 태그 색상" value={color} onChange={setColor} />
        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={!name.trim() || create.isPending}>
            <Plus className="size-4" aria-hidden />
            태그 추가
          </Button>
        </div>
      </form>

      {editing && (
        <TagEditor
          key={editing.id}
          tag={editing}
          pending={update.isPending}
          onSave={(body) => update.mutate({ id: editing.id, body })}
          onClose={() => setEditing(null)}
        />
      )}
      <ConfirmDialog
        open={deleting !== null}
        title="태그 지우기"
        description={
          <>
            <strong>{deleting?.name}</strong> 태그를 지울까요? 모든 할 일에서 이 태그가 떨어져요.
          </>
        }
        confirmLabel="태그 지우기"
        pending={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

function TagEditor({ tag, pending, onSave, onClose }: {
  tag: Tag;
  pending: boolean;
  onSave: (body: { name?: string; color?: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color ?? defaultColor);
  return (
    <Dialog open onClose={onClose} title="태그 바꾸기">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onSave({ name: name.trim(), color });
        }}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="tag-name">이름</Label>
          <Input id="tag-name" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
        </div>
        <ColorPicker label="태그 색상" value={color} onChange={setColor} />
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>취소</Button>
          <Button type="submit" variant="primary" disabled={!name.trim() || pending}>
            저장
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
