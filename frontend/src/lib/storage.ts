// localStorage는 사생활 보호 모드나 차단 설정에서 예외를 던질 수 있다.
// 저장에 실패해도 화면은 동작해야 하므로 모든 접근을 여기서 감싼다.

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // 저장하지 못해도 무시한다 (편의 기능일 뿐)
  }
}

export const storageKeys = {
  token: "sf.token",
  theme: "sf.theme",
  lastListId: "sf.lastListId",
  view: (listId: number) => `sf.view.${listId}`,
  hint: (name: string) => `sf.hint.${name}`,
} as const;
