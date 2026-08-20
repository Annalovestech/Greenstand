"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/app-context";

export function SiteHeader() {
  const pathname = usePathname();
  const { resetDemo } = useApp();
  const inLesson = pathname.includes("/lesson") && !pathname.includes("/summary");

  return (
    <header className="mb-5 flex items-center justify-between gap-3 fade-up">
      <Link href="/" className="group flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--teal)] text-white shadow-[var(--shadow)] transition group-hover:scale-105">
          <span className="font-display text-lg leading-none">Л</span>
        </span>
        <span>
          <span className="font-display block text-xl tracking-tight text-[var(--ink)]">
            Lado
          </span>
          <span className="block text-xs text-[var(--muted)]">
            Bilingual Russian · ages 3–6
          </span>
        </span>
      </Link>
      <div className="flex items-center gap-2">
        {!inLesson && (
          <button
            type="button"
            onClick={resetDemo}
            className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1.5 text-xs font-medium text-[var(--ink-soft)] transition hover:bg-white"
          >
            Reset demo
          </button>
        )}
      </div>
    </header>
  );
}
