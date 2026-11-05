import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export const inputClass =
  "min-h-11 min-w-0 w-full rounded-lg border border-line-strong bg-surface px-3 text-base text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none focus-visible:outline-2";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClass} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${inputClass} pr-8 ${className}`} {...props} />;
}

export function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-fg-muted">
      {children}
    </label>
  );
}
