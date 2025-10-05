// src/components/HeroHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMyWeather } from "@/hooks/useMyWeather";

export default function HeroHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const {
    badgeText,
    loading,
    error,
    retry: retryGeo,
    weatherLoading,
    weatherError,
    perm,
  } = useMyWeather();


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
  const active = "bg-white shadow text-gray-900 border border-white/80";
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

          {/* Center: Nav + Weather */}
          <div className="hidden md:flex items-center gap-3">
            <nav className="flex items-center gap-2">
              <Link
                href="/habit"
                className={`${linkBase} ${
                  pathname.startsWith("/habit") ? active : inactive
                }`}
                aria-current={
                  pathname.startsWith("/habit") ? "page" : undefined
                }
              >
                Habit Quest
              </Link>
              <Link
                href="/diary"
                className={`${linkBase} ${
                  pathname.startsWith("/diary") ? active : inactive
                }`}
                aria-current={
                  pathname.startsWith("/diary") ? "page" : undefined
                }
              >
                Diary Page
              </Link>
            </nav>

            {/* Weather Badge */}
            <div className="ml-2 inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/80 px-3 py-1.5 shadow text-xs text-gray-700">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M6 19a7 7 0 1 1 6.9-8.2A5 5 0 1 1 17 19H6z"
                  fill="currentColor"
                />
              </svg>
              <span className="max-w-[240px] truncate">{badgeText}</span>

              {!loading && (error || weatherError) && (
                <button
                  onClick={retryGeo} 
                  className="ml-1 rounded-lg border px-2 py-0.5 text-xs hover:bg-gray-50"
                >
                  다시 시도
                </button>
              )}

              {/* 권한이 'denied'로 보이면 안내 배지 */}
              {perm === "denied" && (
                <span className="ml-1 text-[11px] text-red-600">
                  브라우저 🔒 아이콘 → 위치 ‘허용’으로 변경
                </span>
              )}
            </div>
          </div>

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
                className={`px-3 py-2 rounded-xl ${
                  pathname.startsWith("/habit")
                    ? active
                    : "text-gray-700 hover:bg-white"
                }`}
              >
                Habit Quest
              </Link>
              <Link
                href="/diary"
                onClick={() => setOpen(false)}
                className={`px-3 py-2 rounded-xl ${
                  pathname.startsWith("/diary")
                    ? active
                    : "text-gray-700 hover:bg-white"
                }`}
              >
                Diary Page
              </Link>

              {/* 모바일에서도 날씨 한 줄 */}
              <div className="mt-2 rounded-xl border border-white/80 bg-white px-3 py-2 text-sm text-gray-700">
                {badgeText}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
