import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:opacity-90",
  secondary: "border border-line-strong bg-surface text-fg hover:bg-subtle",
  ghost: "text-fg hover:bg-subtle",
  danger: "bg-danger text-white hover:opacity-90 dark:text-canvas",
};

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: "md" | "sm";
};

// 터치 영역은 최소 44px(md) — 손가락으로도 잘못 누르지 않게
export function Button({ variant = "secondary", size = "md", className = "", type = "button", ...props }: ButtonProps) {
  const sizing = size === "md" ? "min-h-11 px-4 text-base" : "min-h-9 px-3 text-sm";
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-50 ${sizing} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

type IconButtonProps = ComponentProps<"button"> & { label: string };

// 아이콘만 있는 버튼은 보조 동작에만 쓰고, 이름은 항상 aria-label + title로 알려 준다
export function IconButton({ label, className = "", type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`grid size-9 shrink-0 place-items-center rounded-lg text-fg-muted transition hover:bg-subtle hover:text-fg disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
