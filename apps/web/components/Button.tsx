import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const variants = {
    primary: "bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg",
    secondary: "bg-white text-ink border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50",
    ghost: "bg-transparent text-ink hover:bg-indigo-50/50",
  };
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all duration-200 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
