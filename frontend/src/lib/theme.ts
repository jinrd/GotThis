import { readStorage, storageKeys, writeStorage } from "./storage";

export type ThemeChoice = "system" | "light" | "dark";

export const themeLabels: Record<ThemeChoice, string> = {
  system: "시스템 설정",
  light: "밝게",
  dark: "어둡게",
};

export function readTheme(): ThemeChoice {
  const saved = readStorage(storageKeys.theme);
  return saved === "light" || saved === "dark" ? saved : "system";
}

export function applyTheme(choice: ThemeChoice): void {
  const dark =
    choice === "dark" ||
    (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function saveTheme(choice: ThemeChoice): void {
  writeStorage(storageKeys.theme, choice === "system" ? null : choice);
  applyTheme(choice);
}

// 첫 화면이 그려지기 전에 실행해서 밝은 화면이 번쩍이지 않게 한다.
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${storageKeys.theme}");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})();`;
