"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { applyTheme, readTheme, saveTheme, themeLabels, type ThemeChoice } from "@/lib/theme";

const icons: Record<ThemeChoice, typeof Sun> = { system: Monitor, light: Sun, dark: Moon };

export function ThemeSwitch() {
  const [theme, setTheme] = useState<ThemeChoice>(() => readTheme());

  // "시스템 설정"일 때는 OS 테마가 바뀌면 바로 따라간다
  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  return (
    <div role="radiogroup" aria-label="화면 테마" className="grid grid-cols-3 gap-1 rounded-lg bg-subtle p-1">
      {(Object.keys(themeLabels) as ThemeChoice[]).map((choice) => {
        const Icon = icons[choice];
        const selected = theme === choice;
        return (
          <button
            key={choice}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => {
              saveTheme(choice);
              setTheme(choice);
            }}
            className={`flex min-h-11 items-center sm:min-h-9 justify-center gap-1.5 rounded-md text-sm ${
              selected ? "bg-surface font-medium text-fg shadow-sm" : "text-fg-muted hover:text-fg"
            }`}
          >
            <Icon className="size-4" aria-hidden />
            {choice === "system" ? "자동" : themeLabels[choice]}
          </button>
        );
      })}
    </div>
  );
}
