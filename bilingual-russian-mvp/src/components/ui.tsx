import Link from "next/link";
import type { ReactNode } from "react";

export function PageTitle({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between fade-up">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--teal)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl leading-tight text-[var(--ink)] sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-soft)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--teal)] transition hover:opacity-80"
    >
      <span aria-hidden>←</span> {label}
    </Link>
  );
}

export function PrimaryButton({
  href,
  onClick,
  children,
  className = "",
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  const classes = `inline-flex items-center justify-center rounded-2xl bg-[var(--teal)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow)] transition hover:bg-[var(--teal-deep)] active:scale-[0.98] ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function SecondaryButton({
  href,
  onClick,
  children,
  className = "",
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  const classes = `inline-flex items-center justify-center rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-white active:scale-[0.98] ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function TrendPill({ trend }: { trend: string }) {
  const label =
    trend === "improving"
      ? "Improving"
      : trend === "stable"
        ? "Stable"
        : "Needs attention";
  return (
    <span
      className={`trend-${trend} inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide`}
    >
      {label}
    </span>
  );
}

export function LevelPill({ level }: { level: string }) {
  const label = level.charAt(0).toUpperCase() + level.slice(1).replace("_", " ");
  return (
    <span className="inline-flex rounded-full bg-[var(--teal-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--teal-deep)]">
      {label}
    </span>
  );
}

export function MiniTrend({ trend }: { trend: "improving" | "stable" | "needs_attention" | string }) {
  const stroke =
    trend === "improving"
      ? "var(--good)"
      : trend === "needs_attention"
        ? "var(--attention)"
        : "var(--warn)";
  const points =
    trend === "improving"
      ? "2,14 8,10 14,11 22,4"
      : trend === "needs_attention"
        ? "2,5 8,8 14,7 22,14"
        : "2,10 8,9 14,11 22,10";
  return (
    <svg width="28" height="18" viewBox="0 0 24 18" aria-hidden className="shrink-0">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function LoadingScreen() {
  return (
    <div className="surface flex min-h-[40vh] items-center justify-center p-8 text-sm text-[var(--muted)]">
      Loading demo…
    </div>
  );
}
