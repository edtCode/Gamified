import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const variants = {
    primary: "bg-ink text-[#fbfaf7] shadow-button hover:bg-[#252525]",
    secondary: "soft-surface text-ink border border-ink/15 shadow-panel hover:border-ink/35",
    ghost: "bg-transparent text-ink hover:bg-ink/5",
  };
  return (
    <button
      className={`motion-button inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-all duration-200 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
