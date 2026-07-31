import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  // Square corners throughout — the reference design uses no border radius on
  // buttons, only on badges and avatars.
  primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-pressed",
  outline:
    "border border-primary bg-transparent text-primary hover:bg-primary-surface",
  ghost: "text-primary hover:bg-primary-surface",
  danger: "bg-accent-red text-white hover:brightness-95",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-3.5 text-base",
};

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  type = "button",
  ...props
}: ButtonBaseProps & ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  ...props
}: ButtonBaseProps & ComponentProps<typeof Link>) {
  return (
    <Link
      prefetch={true}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}

/** For external apply links, which must be a plain anchor. */
export function ButtonAnchor({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  ...props
}: ButtonBaseProps & ComponentProps<"a">) {
  return (
    <a
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
