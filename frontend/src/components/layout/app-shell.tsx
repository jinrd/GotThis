"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Menu as MenuIcon, PanelLeftOpen, X } from "lucide-react";
import { getToken, setUnauthorizedHandler } from "@/lib/api/client";
import { readStorage, storageKeys, writeStorage } from "@/lib/storage";
import { useShortcut } from "@/hooks/use-shortcut";
import { useMediaQuery } from "@/hooks/use-media-query";
import { IconButton } from "@/components/ui/button";
import { NewListDialog } from "./new-list-dialog";
import { ShortcutsDialog } from "./shortcuts-dialog";
import { Sidebar } from "./sidebar";

type AppShellApi = {
  openNewList: () => void;
  openSidebar: () => void;
  // 넓은 화면에서 사이드바를 숨겼는지. 숨기면 각 화면 머리글에 다시 여는 버튼이 보인다.
  sidebarCollapsed: boolean;
};
const AppShellContext = createContext<AppShellApi | null>(null);

export function useAppShell(): AppShellApi {
  const api = useContext(AppShellContext);
  if (!api) throw new Error("useAppShell은 AppShell 안에서만 쓸 수 있어요.");
  return api;
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [newListOpen, setNewListOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer || !ready) return;
    if (drawerOpen && !drawer.open) drawer.showModal();
    if (!drawerOpen && drawer.open) drawer.close();
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setDrawerOpen(false); };
    closeOnDesktop();
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [drawerOpen, ready]);

  // 토큰은 브라우저 저장소에만 있으므로 화면은 브라우저에서 확인한 뒤에 그린다
  useEffect(() => {
    if (!getToken()) {
      router.replace(`/login`);
      return;
    }
    setUnauthorizedHandler(() => router.replace("/login?expired=1"));
    /* eslint-disable react-hooks/set-state-in-effect -- 저장소 확인은 마운트 뒤에만 가능하다 */
    setCollapsed(readStorage(storageKeys.sidebarCollapsed) === "true");
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => setUnauthorizedHandler(null);
  }, [router]);

  const changeCollapsed = (next: boolean) => {
    setCollapsed(next);
    writeStorage(storageKeys.sidebarCollapsed, next ? "true" : null);
  };

  useShortcut("?", () => setShortcutsOpen(true), ready);
  useShortcut("[", () => changeCollapsed(!collapsed), ready);

  const api = useMemo<AppShellApi>(
    () => ({
      openNewList: () => setNewListOpen(true),
      // 넓은 화면에서는 숨긴 사이드바를 다시 펼치고, 좁은 화면에서는 서랍을 연다
      openSidebar: () => {
        if (window.matchMedia("(min-width: 1024px)").matches) {
          setCollapsed(false);
          writeStorage(storageKeys.sidebarCollapsed, null);
        } else {
          setDrawerOpen(true);
        }
      },
      sidebarCollapsed: collapsed,
    }),
    [collapsed],
  );

  if (!ready) return null;

  const sidebar = (collapsible: boolean) => (
    <Sidebar
      onCollapse={collapsible ? () => changeCollapsed(true) : undefined}
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
      <div className="app-safe-area flex h-dvh overflow-hidden">
        {/* 넓은 화면: 숨기기 전까지 항상 보이는 사이드바 */}
        {isDesktop && !collapsed && (
          <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:block">{sidebar(true)}</aside>
        )}

        {/* 좁은 화면: 서랍처럼 열리는 사이드바 */}
        <dialog
          ref={drawerRef}
          aria-label="목록 메뉴"
          onClose={(e) => { if (e.target === e.currentTarget) setDrawerOpen(false); }}
          onClick={(e) => { if (e.target === e.currentTarget) setDrawerOpen(false); }}
          className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-80 max-w-[calc(100vw-2rem)] border-0 bg-surface p-0 text-fg shadow-xl lg:hidden"
        >
          <div className="app-safe-area relative h-full">
            <div className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4">
              <IconButton label="메뉴 닫기" onClick={() => setDrawerOpen(false)}>
                <X className="size-5" aria-hidden />
              </IconButton>
            </div>
            {drawerOpen && sidebar(false)}
          </div>
        </dialog>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
      </div>
      <NewListDialog open={newListOpen} onClose={() => setNewListOpen(false)} />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </AppShellContext.Provider>
  );
}

// 사이드바를 여는 버튼 (각 화면의 머리글 왼쪽에 둔다).
// 좁은 화면에서는 항상 보이고, 넓은 화면에서는 사이드바를 숨겼을 때만 보인다.
export function SidebarToggle() {
  const { openSidebar, sidebarCollapsed } = useAppShell();
  return (
    <IconButton
      label={sidebarCollapsed ? "사이드바 보이기 ( [ )" : "목록 메뉴 열기"}
      onClick={openSidebar}
      className={sidebarCollapsed ? "" : "lg:hidden"}
    >
      <MenuIcon className={`size-5 ${sidebarCollapsed ? "lg:hidden" : ""}`} aria-hidden />
      {sidebarCollapsed && <PanelLeftOpen className="hidden size-5 lg:block" aria-hidden />}
    </IconButton>
  );
}

// 사이드바 토글만 있는 머리글. 좁은 화면이나 사이드바를 숨긴 넓은 화면에서만 보인다.
export function ToggleOnlyHeader({ children }: { children?: ReactNode }) {
  const { sidebarCollapsed } = useAppShell();
  return (
    <header className={`flex items-center gap-2 border-b border-line px-4 py-3 ${sidebarCollapsed ? "" : "lg:hidden"}`}>
      <SidebarToggle />
      {children}
    </header>
  );
}
