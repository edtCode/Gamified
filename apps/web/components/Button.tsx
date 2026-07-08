import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const variants = {
    primary: "steel-button border border-silver/55 bg-ink text-steelWhite shadow-button hover:bg-coral",
    secondary: "steel-button soft-surface text-ink border border-silver/70 shadow-panel hover:border-ink/45",
    ghost: "bg-transparent text-ink hover:bg-silver/18",
  };
  return (
    <button
      className={`motion-button inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-all duration-200 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
