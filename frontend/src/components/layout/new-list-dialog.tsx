"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskListApi } from "@/lib/api/endpoints";
import { defaultColor } from "@/lib/colors";
import { errorMessage } from "@/lib/errors";
import { queryKeys } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/field";

export function NewListDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(defaultColor);
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => taskListApi.create({ name: name.trim(), color }),
    onSuccess: async (list) => {
      await qc.invalidateQueries({ queryKey: queryKeys.taskLists });
      close();
      router.push(`/lists/${list.id}`);
    },
    onError: (err) => setError(errorMessage(err)),
  });

  const close = () => {
    setName("");
    setColor(defaultColor);
    setError(null);
    onClose();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("목록 이름을 적어 주세요.");
      return;
    }
    create.mutate();
  };

  return (
    <Dialog open={open} onClose={close} title="새 목록 만들기">
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <Label htmlFor="new-list-name">이름</Label>
          <Input
            id="new-list-name"
            autoFocus
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 회사 일, 장보기, 여행 준비"
            aria-invalid={error !== null}
            aria-describedby={error ? "new-list-error" : undefined}
          />
          {error && (
            <p id="new-list-error" className="mt-1.5 text-sm text-danger">
              {error}
            </p>
          )}
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-fg-muted">색상</p>
          <ColorPicker label="목록 색상" value={color} onChange={setColor} />
        </div>
        <p className="text-sm text-fg-muted">
          만들면 &lsquo;할 일 · 진행 중 · 완료&rsquo; 상태가 기본으로 들어가요. 나중에 바꿀 수 있어요.
        </p>
        <div className="flex justify-end gap-2">
          <Button onClick={close}>취소</Button>
          <Button type="submit" variant="primary" disabled={create.isPending}>
            만들기
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
