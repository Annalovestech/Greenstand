"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/app-context";
import type { AppRole } from "@/lib/types";

export function SiteHeader() {
  const pathname = usePathname();
  const { resetDemo, state, setRole } = useApp();
  const inLesson =
    pathname.includes("/lesson") && !pathname.includes("/summary");

  return (
    <header className="mb-6 fade-up">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--teal)] text-white">
            <span className="font-display text-base leading-none">Л</span>
          </span>
          <span>
            <span className="font-display block text-[1.2rem] leading-none tracking-tight text-[var(--ink)]">
              Lado
            </span>
            {!inLesson ? (
              <span className="mt-0.5 block text-[11px] text-[var(--muted)]">
                Russian · ages 3–6
              </span>
            ) : null}
          </span>
        </Link>

        {!inLesson ? (
          <div className="flex items-center gap-2">
            <RoleSwitch value={state.role} onChange={setRole} />
            <button
              type="button"
              onClick={resetDemo}
              className="text-[12px] font-medium text-[var(--muted)] transition hover:text-[var(--ink-soft)]"
            >
              Reset
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function RoleSwitch({
  value,
  onChange,
}: {
  value: AppRole;
  onChange: (role: AppRole) => void;
}) {
  const roles: AppRole[] = ["teacher", "parent", "admin"];
  return (
    <div className="flex items-center gap-0.5 rounded-full bg-[rgba(120,120,128,0.12)] p-0.5">
      {roles.map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => onChange(role)}
          className={`rounded-full px-2 py-1 text-[11px] font-semibold capitalize transition ${
            value === role
              ? "bg-white text-[var(--ink)] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              : "text-[var(--muted)]"
          }`}
        >
          {role}
        </button>
      ))}
    </div>
  );
}
