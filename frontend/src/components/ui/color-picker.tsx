"use client";

import { Check } from "lucide-react";
import { palette } from "@/lib/colors";

export function ColorPicker({
  value,
  onChange,
  label,
}: {
  value: string | null;
  onChange: (color: string) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {palette.map((color) => {
        const selected = value?.toLowerCase() === color.value;
        return (
          <button
            key={color.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={color.name}
            title={color.name}
            onClick={() => onChange(color.value)}
            className={`grid size-9 place-items-center rounded-full border-2 ${
              selected ? "border-fg" : "border-transparent"
            }`}
          >
            <span className="grid size-7 place-items-center rounded-full" style={{ backgroundColor: color.value }}>
              {selected && <Check className="size-4 text-white" aria-hidden />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ColorDot({ color, className = "size-3" }: { color: string | null; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 rounded-full ${className} ${color ? "" : "border border-line-strong"}`}
      style={color ? { backgroundColor: color } : undefined}
    />
  );
}
