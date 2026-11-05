# StudyFlow Frontend

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 · TanStack Query · dnd-kit

## 실행

```bash
npm install
npm run dev            # http://localhost:3000
```

- `/api/*` 요청은 `next.config.ts`의 rewrites로 백엔드에 전달된다. 기본 대상은 `http://localhost:8080`이고 `BACKEND_URL`로 바꿀 수 있다.
  ```bash
  BACKEND_URL=http://localhost:8081 npm run dev -- -p 3001
  ```
- Node.js 20.9 이상이 필요하다.

## 구조

```
src/
  app/                      라우트 (login, signup, lists, lists/[listId])
  components/
    ui/                     버튼·입력·다이얼로그·메뉴·토스트 등 공용 부품
    layout/                 앱 뼈대, 사이드바, 테마 전환
    lists/                  목록 화면 (ListScreen)
    tasks/                  리스트/보드 뷰, 카드, 드래그 앤 드롭, 상세 패널, 필터
    settings/               목록 설정 (기본·상태·필드·태그)
  hooks/                    쿼리 훅, 할 일 변경(useTaskActions), 단축키
  lib/
    api/                    타입, fetch 클라이언트, 엔드포인트
    tasks.ts, errors.ts ...  순수 함수
```

설계 원리는 `docs/principles/phase-8-frontend.md`에 있다.
