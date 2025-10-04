//App/app/diary/page.tsx

"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { DiaryEntryUI } from "@/components/diary/type/diary";
import DiaryForm from "@/components/diary/DiaryForm";
import DiaryList from "@/components/diary/DiaryList";
import { Card, Pill } from "@/components/diary/ui/atoms";
import { fmtDate } from "@/components/diary/lib/date";
import { DIARY_KEY, awardHabitQuestIfFirstOfDay } from "@/components/diary/lib/storage";

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntryUI[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(DIARY_KEY);
      return raw ? (JSON.parse(raw) as DiaryEntryUI[]) : [];
    } catch {
      return [];
    }
  });

  const today = fmtDate();

  const [editingId, setEditingId] = useState<string | null>(null);

  // persist
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DIARY_KEY, JSON.stringify(entries));
    }
  }, [entries]);

  // Stats (by mood & by date)
  const countsByMood = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach((e) => (map[e.mood] = (map[e.mood] || 0) + 1));
    return map;
  }, [entries]);

  const listByDateDesc = useMemo(() => {
    return [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [entries]);

  // Filters
  const [q, setQ] = useState("");
  const [moodFilter, setMoodFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return listByDateDesc.filter((e) => {
      const matchMood = moodFilter === "ALL" || e.mood === moodFilter;
      const matchQ =
        q.trim() === "" ||
        `${e.title} ${e.content} ${e.location || ""}`
          .toLowerCase()
          .includes(q.trim().toLowerCase());
      return matchMood && matchQ;
    });
  }, [listByDateDesc, q, moodFilter]);

  // Counts for header
  const todayCount = entries.filter((e) => e.date === today).length;

  // CRUD handlers
  const handleCreateOrUpdate = (payload: {
    date: string;
    title: string;
    content: string;
    mood: DiaryEntryUI["mood"];
    locationName: string;
  }) => {
    const now = new Date().toISOString();

    if (editingId) {
      setEntries((prev) =>
        prev.map((x) =>
          x.id === editingId
            ? {
                ...x,
                date: payload.date,
                title: payload.title,
                content: payload.content,
                mood: payload.mood,
                location: payload.locationName || undefined,
                updatedAt: now,
              }
            : x
        )
      );
      setEditingId(null);
      return;
    }

    // 새 작성
    const beforeTodayCount = entries.filter((e) => e.date === today).length;

    const newEntry: DiaryEntryUI = {
      id: crypto.randomUUID(),
      date: payload.date,
      title: payload.title,
      content: payload.content,
      mood: payload.mood,
      location: payload.locationName || undefined,
      createdAt: now,
      updatedAt: now,
    };

    // HabitQuest 보상 (오늘 첫 저장 시 1회)
    if (payload.date === today) {
      awardHabitQuestIfFirstOfDay({
        entriesTodayCountBeforeAdd: beforeTodayCount,
        today,
      });
    }

    setEntries((prev) => [newEntry, ...prev]);
  };

  const onEdit = (id: string) => setEditingId(id);

  const onDelete = (id: string) => {
    if (!confirm("이 일기를 삭제할까요?")) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const editingTarget =
    editingId ? entries.find((e) => e.id === editingId) ?? null : null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-100 via-indigo-100 to-purple-200 text-slate-800">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Daily Diary
            </h1>
            <p className="text-sm opacity-70 mt-1">
              오늘 날짜: <strong>{today}</strong> · 오늘 작성 {todayCount}건
            </p>
          </div>
        </div>

        {/* Write form */}
        <DiaryForm
          initialDate={today}
          editing={editingTarget}
          onSubmit={handleCreateOrUpdate}
          onCancelEdit={() => setEditingId(null)}
        />

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="검색 (제목/내용/장소)"
            className="px-3 py-2 rounded-xl border border-black/10"
          />
          <select
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-black/10"
          >
            <option value="ALL">모든 감정</option>
            <option value="HAPPY">HAPPY</option>
            <option value="PROUD">PROUD</option>
            <option value="FOCUSED">FOCUSED</option>
            <option value="NEUTRAL">NEUTRAL</option>
            <option value="TIRED">TIRED</option>
            <option value="SAD">SAD</option>
          </select>
          <Card>
            <div className="text-sm flex flex-wrap gap-2">
              {Object.entries(countsByMood).map(([k, v]) => (
                <Pill key={k}>
                  {k}: <strong className="ml-1">{v}</strong>
                </Pill>
              ))}
              {Object.keys(countsByMood).length === 0 && (
                <span className="opacity-60">아직 통계가 없습니다.</span>
              )}
            </div>
          </Card>
        </div>

        {/* List */}
        <DiaryList items={filtered} onEdit={onEdit} onDelete={onDelete} />

        <div className="mt-8 text-center text-xs opacity-70">
          HabitQuest가 같은 브라우저에 있다면, 오늘 첫 일기 저장 시 자동으로
          XP(+20)와 코인(+8)을 1회 지급합니다.
        </div>
      </div>
    </div>
  );
}
