"use client";

import { useEffect, useState, type RefObject } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { priorities, type Status, type Tag, type TaskFilter } from "@/lib/api/types";
import { priorityLabels, todayString } from "@/lib/tasks";
import { Button } from "@/components/ui/button";
import { inputClass, Select } from "@/components/ui/field";

export type DuePreset = "" | "overdue" | "today" | "week";

export type FilterState = Omit<TaskFilter, "dueFrom" | "dueTo"> & { due: DuePreset };

export const emptyFilter: FilterState = { due: "" };

const duePresetLabels: Record<Exclude<DuePreset, "">, string> = {
  overdue: "기한 지남",
  today: "오늘까지",
  week: "7일 안",
};

function shiftDays(base: string, days: number): string {
  const [y, m, d] = base.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

// 화면의 필터 상태 → 백엔드 쿼리 파라미터 (마감일은 쉬운 선택지로 보여 주고 날짜 범위로 바꿔 보낸다)
export function toTaskFilter({ due, ...rest }: FilterState): TaskFilter {
  const today = todayString();
  const range: Pick<TaskFilter, "dueFrom" | "dueTo"> =
    due === "overdue"
      ? { dueTo: shiftDays(today, -1) }
      : due === "today"
        ? { dueTo: today }
        : due === "week"
          ? { dueFrom: today, dueTo: shiftDays(today, 6) }
          : {};
  return { ...rest, ...range };
}

export function countActive(filter: FilterState): number {
  return [filter.statusId, filter.priority, filter.tagId, filter.keyword, filter.due || undefined].filter(
    (v) => v !== undefined && v !== "",
  ).length;
}

type FilterBarProps = {
  filter: FilterState;
  onChange: (filter: FilterState) => void;
  statuses: Status[];
  tags: Tag[];
  searchRef: RefObject<HTMLInputElement | null>;
};

export function FilterBar({ filter, onChange, statuses, tags, searchRef }: FilterBarProps) {
  const [keyword, setKeyword] = useState(filter.keyword ?? "");
  const [panelOpen, setPanelOpen] = useState(false);
  const activeCount = countActive({ ...filter, keyword: undefined });

  // 글자를 칠 때마다 요청하지 않도록 잠깐 멈췄을 때만 검색한다
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = keyword.trim() || undefined;
      if (trimmed !== filter.keyword) onChange({ ...filter, keyword: trimmed });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [keyword, filter, onChange]);

  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) => onChange({ ...filter, [key]: value });

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1 md:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-fg-muted" aria-hidden />
          <input
            ref={searchRef}
            type="search"
            value={keyword}
            maxLength={100}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") e.currentTarget.blur();
            }}
            placeholder="제목·설명 검색"
            aria-label="할 일 검색"
            className={`${inputClass} pl-10`}
          />
        </div>
        <Button
          onClick={() => setPanelOpen((v) => !v)}
          aria-expanded={panelOpen}
          aria-controls="filter-panel"
          className={activeCount > 0 ? "border-accent text-accent" : ""}
        >
          <SlidersHorizontal className="size-5" aria-hidden />
          필터
          {activeCount > 0 && (
            <span className="rounded-full bg-accent px-1.5 text-xs font-semibold text-accent-fg">{activeCount}</span>
          )}
        </Button>
      </div>

      {panelOpen && (
        <div id="filter-panel" className="grid grid-cols-2 gap-3 rounded-xl bg-subtle p-3 md:flex md:flex-wrap md:items-center">
          <Select
            aria-label="상태로 거르기"
            value={filter.statusId ?? ""}
            onChange={(e) => set("statusId", e.target.value ? Number(e.target.value) : undefined)}
            className="md:w-40"
          >
            <option value="">모든 상태</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Select
            aria-label="중요도로 거르기"
            value={filter.priority ?? ""}
            onChange={(e) => set("priority", (e.target.value || undefined) as FilterState["priority"])}
            className="md:w-40"
          >
            <option value="">중요도</option>
            {priorities.map((p) => (
              <option key={p} value={p}>
                {priorityLabels[p]}
              </option>
            ))}
          </Select>
          <Select
            aria-label="태그로 거르기"
            value={filter.tagId ?? ""}
            onChange={(e) => set("tagId", e.target.value ? Number(e.target.value) : undefined)}
            className="md:w-40"
          >
            <option value="">모든 태그</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <Select
            aria-label="마감일로 거르기"
            value={filter.due}
            onChange={(e) => set("due", e.target.value as DuePreset)}
            className="md:w-40"
          >
            <option value="">마감일 전체</option>
            {Object.entries(duePresetLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              className="col-span-2 text-fg-muted md:col-span-1"
              onClick={() => onChange({ ...emptyFilter, keyword: filter.keyword })}
            >
              <X className="size-4" aria-hidden />
              필터 지우기
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
