"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu as MenuIcon, X } from "lucide-react";
import { getToken, setUnauthorizedHandler } from "@/lib/api/client";
import { useShortcut } from "@/hooks/use-shortcut";
import { IconButton } from "@/components/ui/button";
import { NewListDialog } from "./new-list-dialog";
import { ShortcutsDialog } from "./shortcuts-dialog";
import { Sidebar } from "./sidebar";

type AppShellApi = { openNewList: () => void; openSidebar: () => void };
const AppShellContext = createContext<AppShellApi | null>(null);

export function useAppShell(): AppShellApi {
  const api = useContext(AppShellContext);
  if (!api) throw new Error("useAppShell은 AppShell 안에서만 쓸 수 있어요.");
  return api;
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [newListOpen, setNewListOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 토큰은 브라우저 저장소에만 있으므로 화면은 브라우저에서 확인한 뒤에 그린다
  useEffect(() => {
    if (!getToken()) {
      router.replace(`/login`);
      return;
    }
    setUnauthorizedHandler(() => router.replace("/login?expired=1"));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 저장소 확인은 마운트 뒤에만 가능하다
    setReady(true);
    return () => setUnauthorizedHandler(null);
  }, [router]);

  useShortcut("?", () => setShortcutsOpen(true), ready);

  const api = useMemo<AppShellApi>(
    () => ({ openNewList: () => setNewListOpen(true), openSidebar: () => setDrawerOpen(true) }),
    [],
  );

  if (!ready) return null;

  const sidebar = (
    <Sidebar
      onNewList={() => {
        setDrawerOpen(false);
        setNewListOpen(true);
      }}
      onShortcuts={() => {
        setDrawerOpen(false);
        setShortcutsOpen(true);
      }}
      onNavigate={() => setDrawerOpen(false)}
    />
  );

  return (
    <AppShellContext.Provider value={api}>
      <div className="flex h-dvh overflow-hidden">
        {/* 넓은 화면: 항상 보이는 사이드바 */}
        <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:block">{sidebar}</aside>

        {/* 좁은 화면: 서랍처럼 열리는 사이드바 */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" key={pathname}>
            <div className="absolute inset-0 bg-black/45" onClick={() => setDrawerOpen(false)} aria-hidden />
            <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-surface shadow-xl">
              <div className="absolute top-3 right-3">
                <IconButton label="메뉴 닫기" onClick={() => setDrawerOpen(false)}>
                  <X className="size-5" aria-hidden />
                </IconButton>
              </div>
              {sidebar}
            </aside>
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
      <NewListDialog open={newListOpen} onClose={() => setNewListOpen(false)} />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </AppShellContext.Provider>
  );
}

// 좁은 화면에서 사이드바를 여는 버튼 (각 화면의 머리글 왼쪽에 둔다)
export function SidebarToggle() {
  const { openSidebar } = useAppShell();
  return (
    <IconButton label="목록 메뉴 열기" onClick={openSidebar} className="lg:hidden">
      <MenuIcon className="size-5" aria-hidden />
    </IconButton>
  );
}
