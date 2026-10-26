import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  loading?: boolean;
  children: ReactNode;
};

const variants = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-primary/10 text-primary hover:bg-primary/15",
  outline:
    "border border-outline bg-surface text-foreground hover:bg-background",
  danger: "bg-danger text-white hover:bg-danger/90",
  ghost: "text-muted hover:bg-background hover:text-foreground",
};

export default function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <LoaderCircle size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
