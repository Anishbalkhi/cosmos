import Link from "next/link";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost" | "light";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full px-6 h-12 text-sm font-semibold tracking-wide transition-all duration-300 ease-cosmic disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-flare text-space hover:bg-flare-soft shadow-[0_0_0_0_rgb(var(--accent-rgb)/0.5)] hover:shadow-[0_0_40px_4px_rgb(var(--accent-rgb)/0.35)]",
  ghost: "border border-star/25 text-star hover:border-star/50 hover:bg-white/5",
  light: "bg-star text-space hover:bg-white",
};

function Arrow() {
  return (
    <span aria-hidden className="transition-transform duration-300 ease-cosmic group-hover:translate-x-1">
      →
    </span>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  arrow = false,
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} data-magnetic data-sfx="press" className={clsx(base, variants[variant], className)}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

export function Button({
  variant = "primary",
  arrow = false,
  className,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; arrow?: boolean }) {
  return (
    <button data-magnetic data-sfx="press" className={clsx(base, variants[variant], className)} {...props}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}
