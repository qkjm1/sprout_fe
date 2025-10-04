"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function HeroHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const linkBase =
    "px-3 py-2 rounded-xl text-sm font-medium hover:bg-white hover:shadow transition";
  const active =
    "bg-white shadow text-gray-900 border border-white/80";
  const inactive = "text-gray-600";

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur bg-white/60 border-b border-white/50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Left: Logo/Title */}
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/80 text-white font-bold">
              HQ
            </span>
            <span className="text-sm sm:text-base font-semibold text-gray-800">
              HabitQuest
            </span>
          </div>

          {/* Center: Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/habit"
              className={`${linkBase} ${
                pathname.startsWith("/habit") ? active : inactive
              }`}
              aria-current={pathname.startsWith("/habit") ? "page" : undefined}
            >
              Habit Quest
            </Link>
            <Link
              href="/diary"
              className={`${linkBase} ${
                pathname.startsWith("/diary") ? active : inactive
              }`}
              aria-current={pathname.startsWith("/diary") ? "page" : undefined}
            >
              Diary Page
            </Link>
          </nav>

          {/* Right: Mobile menu button */}
          <div className="md:hidden">
            <button
              ref={btnRef}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-lg border border-white/80 bg-white/70 px-2.5 py-1.5 shadow text-gray-700"
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div
            ref={panelRef}
            className="md:hidden mt-2 rounded-2xl border border-white/80 bg-white/80 shadow p-2"
          >
            <div className="flex flex-col">
              <Link
                href="/habit"
                onClick={() => setOpen(false)}
                className={`px-3 py-2 rounded-xl ${pathname.startsWith("/habit") ? active : "text-gray-700 hover:bg-white"}`}
              >
                Habit Quest
              </Link>
              <Link
                href="/diary"
                onClick={() => setOpen(false)}
                className={`px-3 py-2 rounded-xl ${pathname.startsWith("/diary") ? active : "text-gray-700 hover:bg-white"}`}
              >
                Diary Page
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
