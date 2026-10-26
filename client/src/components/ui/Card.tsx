import type { HTMLAttributes, ReactNode } from "react";
type CardProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };
export default function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-outline bg-surface p-5 shadow-sm shadow-slate-950/[0.02] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
