"use client";

import { useState } from "react";
import type { FieldDefinition, PropertyValue } from "@/lib/api/types";
import { inputClass, Select } from "@/components/ui/field";

type PropertyInputProps = {
  field: FieldDefinition;
  value: PropertyValue | undefined;
  onSave: (value: PropertyValue | null) => void;
};

// 사용자 정의 필드 하나의 입력칸. 값 검증은 서버(FieldDefinition.normalizeValue)가 최종 판단한다.
export function PropertyInput({ field, value, onSave }: PropertyInputProps) {
  const id = `field-${field.id}`;

  switch (field.type) {
    case "CHECKBOX":
      return (
        <label htmlFor={id} className="flex min-h-11 items-center gap-3 text-base">
          <input
            id={id}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onSave(e.target.checked)}
            className="size-5 accent-[var(--accent)]"
          />
          {field.name}
        </label>
      );
    case "SELECT":
      return (
        <Select id={id} value={typeof value === "string" ? value : ""} onChange={(e) => onSave(e.target.value || null)}>
          <option value="">선택 안 함</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      );
    case "DATE":
      return (
        <input
          id={id}
          type="date"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onSave(e.target.value || null)}
          className={inputClass}
        />
      );
    case "NUMBER":
    case "TEXT":
      return <TextLikeInput id={id} field={field} value={value} onSave={onSave} />;
  }
}

// 글자·숫자는 칠 때마다 저장하지 않고, 입력칸을 벗어날 때 한 번 저장한다
function TextLikeInput({ id, field, value, onSave }: PropertyInputProps & { id: string }) {
  const initial = value === undefined ? "" : String(value);
  const [draft, setDraft] = useState(initial);
  const isNumber = field.type === "NUMBER";

  const commit = () => {
    if (draft === initial) return;
    if (draft.trim() === "") {
      onSave(null);
    } else if (isNumber) {
      const parsed = Number(draft);
      if (Number.isFinite(parsed)) onSave(parsed);
      else setDraft(initial);
    } else {
      onSave(draft);
    }
  };

  return (
    <input
      id={id}
      type={isNumber ? "number" : "text"}
      inputMode={isNumber ? "decimal" : undefined}
      maxLength={isNumber ? undefined : 1000}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.nativeEvent.isComposing) e.currentTarget.blur();
      }}
      className={inputClass}
    />
  );
}
