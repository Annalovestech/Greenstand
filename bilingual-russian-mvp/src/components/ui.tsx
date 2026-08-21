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
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between fade-up">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-[13px] font-medium text-[var(--muted)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-[1.85rem] leading-[1.15] tracking-tight text-[var(--ink)] sm:text-[2.15rem]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[var(--ink-soft)]">
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
      className="mb-5 inline-flex items-center gap-1 text-[15px] font-medium text-[var(--teal)] transition hover:opacity-70"
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
  type = "button",
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
}) {
  const classes = `inline-flex items-center justify-center rounded-[14px] bg-[var(--teal)] px-5 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[var(--teal-deep)] active:scale-[0.98] ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function SecondaryButton({
  href,
  onClick,
  children,
  className = "",
  type = "button",
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
}) {
  const classes = `inline-flex items-center justify-center rounded-[14px] bg-transparent px-4 py-3 text-[15px] font-semibold text-[var(--teal)] transition hover:bg-[var(--teal-soft)]/60 active:scale-[0.98] ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function QuietButton({
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
  const classes = `inline-flex items-center justify-center text-[13px] font-medium text-[var(--muted)] transition hover:text-[var(--ink-soft)] ${className}`;
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

export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="inline-flex rounded-full bg-[rgba(120,120,128,0.12)] p-0.5">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
              active
                ? "bg-white text-[var(--ink)] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                : "text-[var(--muted)]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
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

export function MiniTrend({
  trend,
}: {
  trend: "improving" | "stable" | "needs_attention" | string;
}) {
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
    <svg
      width="28"
      height="18"
      viewBox="0 0 24 18"
      aria-hidden
      className="shrink-0"
    >
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
    <div className="flex min-h-[40vh] items-center justify-center p-8 text-[15px] text-[var(--muted)]">
      Loading…
    </div>
  );
}

export function StatusDot({ status }: { status: string }) {
  const color =
    status === "live"
      ? "bg-[var(--good)]"
      : status === "upcoming"
        ? "bg-[var(--teal)]"
        : status === "completed"
          ? "bg-[var(--muted)]"
          : status === "cancelled" || status === "no_show"
            ? "bg-[var(--attention)]"
            : "bg-[var(--amber)]";
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />;
}
