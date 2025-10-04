"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ==============================
// 💾 Types
// ==============================
type Habit = {
  id: string;
  name: string;
  xp: number; // XP per completion
  coins: number; // coins per completion
  createdAt: string; // ISO date
  streak: number; // current streak in days
  bestStreak: number;
  lastDone: string | null; // ISO date for last completion
  active: boolean;
};

type SaveState = {
  habits: Habit[];
  // YYYY-MM-DD -> habitId[] completed that day
  completions: Record<string, string[]>;
  totalXP: number;
  coins: number;
  badges: string[]; // earned badge ids
  version: number;
};

// ==============================
// 🕒 Date helpers (local / KST friendly)
// ==============================
const fmtDate = (d = new Date()) => {
  // format as YYYY-MM-DD using local timezone
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const daysBetween = (aISO: string, bISO: string) => {
  const a = new Date(aISO);
  const b = new Date(bISO);
  const ms = 24 * 60 * 60 * 1000;
  const diff = Math.floor(
    (Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
      Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) /
      ms
  );
  return diff;
};

// ==============================
// 🏅 Badges catalog
// ==============================
const BADGES = [
  {
    id: "streak7",
    name: "7일 연속",
    desc: "꾸준함의 시동!",
    condition: (s: SaveState) => s.habits.some((h) => h.bestStreak >= 7),
  },
  {
    id: "streak30",
    name: "30일 연속",
    desc: "골드 꾸준러",
    condition: (s: SaveState) => s.habits.some((h) => h.bestStreak >= 30),
  },
  {
    id: "xp1k",
    name: "XP 1,000",
    desc: "레벨업의 달인",
    condition: (s: SaveState) => s.totalXP >= 1000,
  },
  {
    id: "firstCoin",
    name: "첫 코인",
    desc: "보상 맛보기",
    condition: (s: SaveState) => s.coins >= 1,
  },
];

// ==============================
// 🛍️ Shop
// ==============================
const SHOP = [
  { id: "snack", name: "간식 보상", cost: 50 },
  { id: "yt30", name: "유튜브 30분", cost: 100 },
  { id: "weekend", name: "주말 특별활동", cost: 200 },
];

// ==============================
// 🧠 Defaults
// ==============================
const defaultHabits: Habit[] = [
  {
    id: "water",
    name: "아침 물 한 컵",
    xp: 5,
    coins: 2,
    createdAt: fmtDate(),
    streak: 0,
    bestStreak: 0,
    lastDone: null,
    active: true,
  },
  {
    id: "study",
    name: "공부 30분",
    xp: 15,
    coins: 5,
    createdAt: fmtDate(),
    streak: 0,
    bestStreak: 0,
    lastDone: null,
    active: true,
  },
  {
    id: "exercise",
    name: "운동 10분",
    xp: 10,
    coins: 4,
    createdAt: fmtDate(),
    streak: 0,
    bestStreak: 0,
    lastDone: null,
    active: true,
  },
  {
    id: "journal",
    name: "일기 쓰기",
    xp: 20,
    coins: 8,
    createdAt: fmtDate(),
    streak: 0,
    bestStreak: 0,
    lastDone: null,
    active: true,
  },
];

const defaultState: SaveState = {
  habits: defaultHabits,
  completions: {},
  totalXP: 0,
  coins: 0,
  badges: [],
  version: 1,
};

const STORAGE_KEY = "habitQuest_v1";

// ==============================
// 🎛️ UI Helpers
// ==============================
const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <div
    className={`rounded-2xl shadow-md p-4 bg-white/80 backdrop-blur border border-black/5 ${className}`}
  >
    {children}
  </div>
);

const Pill: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-black/5 ${className}`}
  >
    {children}
  </span>
);

const Button: React.FC<
  React.PropsWithChildren<{
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    type?: "button" | "submit";
  }>
> = ({ onClick, className = "", children, disabled, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-2 rounded-xl shadow-sm border border-black/10 hover:shadow transition active:translate-y-px disabled:opacity-40 ${className}`}
  >
    {children}
  </button>
);

// ==============================
// 🧩 Main Component
// ==============================
export default function HabitQuest() {
  const [state, setState] = useState<SaveState>(() => {
    if (typeof window === "undefined") return defaultState;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SaveState) : defaultState;
    } catch {
      return defaultState;
    }
  });

  const today = fmtDate();

  // Persist
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Derived
  const level = Math.floor(state.totalXP / 100) + 1;
  const nextLevelXP = level * 100;
  const prevLevelXP = (level - 1) * 100;
  const levelProgress = Math.min(
    100,
    Math.round(
      ((state.totalXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100
    )
  );

  // 7-day XP chart
  const chartData = useMemo(() => {
    const arr: { day: string; xp: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = fmtDate(d);
      const ids = state.completions[key] || [];
      const xp = ids
        .map((id) => state.habits.find((h) => h.id === id)?.xp || 0)
        .reduce((a, b) => a + b, 0);
      arr.push({ day: key.slice(5), xp });
    }
    return arr;
  }, [state.completions, state.habits]);

  // Earn badges
  useEffect(() => {
    const earned = new Set(state.badges);
    BADGES.forEach((b) => {
      if (!earned.has(b.id) && b.condition(state)) earned.add(b.id);
    });
    if (earned.size !== state.badges.length) {
      setState((s) => ({ ...s, badges: Array.from(earned) }));
    }
  }, [state.totalXP, state.coins, state.habits]);

  const toggleDone = (habit: Habit) => {
    setState((prev) => {
      const completions = { ...prev.completions };
      const todayList = new Set(completions[today] || []);
      const already = todayList.has(habit.id);

      const habits = prev.habits.map((h) => ({ ...h }));
      const target = habits.find((h) => h.id === habit.id)!;

      if (already) {
        // Undo
        todayList.delete(habit.id);
        completions[today] = Array.from(todayList);
        // streak rollback if lastDone was today
        if (target.lastDone === today) {
          target.lastDone = null; // ambiguous, but we keep simple
          target.streak = Math.max(0, target.streak - 1);
        }
        return {
          ...prev,
          completions,
          habits,
          totalXP: Math.max(0, prev.totalXP - habit.xp),
          coins: Math.max(0, prev.coins - habit.coins),
        };
      } else {
        // Do complete
        todayList.add(habit.id);
        completions[today] = Array.from(todayList);

        // streak update
        if (!target.lastDone) {
          target.streak = 1;
        } else {
          const gap = daysBetween(target.lastDone, today);
          if (gap === 1) target.streak += 1;
          else if (gap > 1) target.streak = 1; // reset after break
          // gap === 0 -> already done today (but we checked above)
        }
        target.lastDone = today;
        target.bestStreak = Math.max(target.bestStreak, target.streak);

        return {
          ...prev,
          completions,
          habits,
          totalXP: prev.totalXP + habit.xp,
          coins: prev.coins + habit.coins,
        };
      }
    });
  };

  const addHabit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const xp = clampInt(fd.get("xp"), 1, 999);
    const coins = clampInt(fd.get("coins"), 0, 99);
    if (!name) return;
    setState((prev) => ({
      ...prev,
      habits: [
        ...prev.habits,
        {
          id: crypto.randomUUID(),
          name,
          xp,
          coins,
          createdAt: fmtDate(),
          streak: 0,
          bestStreak: 0,
          lastDone: null,
          active: true,
        },
      ],
    }));
    e.currentTarget.reset();
  };

  const archiveHabit = (id: string) =>
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === id ? { ...h, active: false } : h
      ),
    }));

  const buy = (cost: number) =>
    setState((prev) => ({ ...prev, coins: Math.max(0, prev.coins - cost) }));

  const resetToday = () =>
    setState((prev) => {
      const todayIds = new Set(prev.completions[today] || []);
      if (todayIds.size === 0) return prev;
      const habits = prev.habits.map((h) => ({ ...h }));
      // Rollback simplistic: if lastDone was today and in completions, reduce streak by 1
      habits.forEach((h) => {
        if (todayIds.has(h.id) && h.lastDone === today) {
          h.streak = Math.max(0, h.streak - 1);
          h.lastDone = null;
        }
      });

      const refundXP = Array.from(todayIds)
        .map((id) => habits.find((h) => h.id === id)?.xp || 0)
        .reduce((a, b) => a + b, 0);
      const refundCoins = Array.from(todayIds)
        .map((id) => habits.find((h) => h.id === id)?.coins || 0)
        .reduce((a, b) => a + b, 0);

      const completions = { ...prev.completions };
      delete completions[today];

      return {
        ...prev,
        completions,
        habits,
        totalXP: Math.max(0, prev.totalXP - refundXP),
        coins: Math.max(0, prev.coins - refundCoins),
      };
    });

  const clearAll = () => {
    if (confirm("모든 진행 데이터를 초기화할까요?")) setState(defaultState);
  };

  const activeHabits = state.habits.filter((h) => h.active);
  const todayDone = new Set(state.completions[today] || []);
  // 유틸
  const clampInt = (v: any, min = 0, max = 99) => {
    const n = Math.floor(Number(v) || 0);
    return Math.min(max, Math.max(min, n));
  };

  return (
    <div className="max-h-100vh w-full bg-gradient-to-br from-sky-100 via-indigo-100 to-purple-200 text-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Habit Quest
            </h1>
            <p className="text-sm opacity-70 mt-1">
              오늘 날짜: <strong>{today}</strong> · 꾸준한 새싹 기르기!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Pill>
              레벨 <strong className="ml-1">{level}</strong>
            </Pill>
            <Pill>
              XP <strong className="ml-1">{state.totalXP}</strong>
            </Pill>
            <Pill>
              코인 <strong className="ml-1">{state.coins}</strong>
            </Pill>
            <Button className="bg-white" onClick={resetToday}>
              오늘 기록 취소
            </Button>
            <Button className="bg-white" onClick={clearAll}>
              초기화
            </Button>
          </div>
        </div>

        {/* Level bar */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">레벨 진행도</div>
            <div className="text-sm opacity-70">
              {state.totalXP - prevLevelXP} / {nextLevelXP - prevLevelXP} XP
            </div>
          </div>
          <div className="w-full h-3 bg-black/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Habits */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold">오늘의 퀘스트</h2>
                <span className="text-sm opacity-70">
                  완료 {todayDone.size} / {activeHabits.length}
                </span>
              </div>

              <div className="space-y-3">
                {activeHabits.map((h) => {
                  const done = todayDone.has(h.id);
                  return (
                    <motion.div
                      key={h.id}
                      layout
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        done
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-white border-black/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => toggleDone(h)}
                          className="h-5 w-5"
                        />
                        <div>
                          <div className="font-semibold">{h.name}</div>
                          <div className="text-xs opacity-70">
                            연속 {h.streak}일 · 최고 {h.bestStreak}일
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Pill>+{h.xp} XP</Pill>
                        <Pill>+{h.coins}💰</Pill>
                        <Button
                          className="bg-white"
                          onClick={() => archiveHabit(h.id)}
                        >
                          보관
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}

                {activeHabits.length === 0 && (
                  <div className="text-sm opacity-70">
                    활성화된 습관이 없습니다. 아래에서 새 습관을 추가하세요.
                  </div>
                )}
              </div>

              {/* Add habit */}
              <form
                onSubmit={addHabit} 
                className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-2"
              >
                <input
                  name="name"
                  placeholder="새 습관 이름"
                  className="md:col-span-3 px-3 py-2 rounded-xl border border-black/10"
                />

                <input
                  name="xp"
                  type="number"
                  min={1}
                  max={999}
                  step={1}
                  defaultValue={10}
                  placeholder="XP"
                  inputMode="numeric"
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.value = String(clampInt(el.value, 1, 999));
                  }}
                  onKeyDown={(e) => {
                    // 숫자 외 입력 방지(e,+,-,.) & 화살표 스크롤 방지
                    if (["e", "E", "+", "-", "."].includes(e.key))
                      e.preventDefault();
                  }}
                  className="px-3 py-2 rounded-xl border border-black/10"
                />

                <div className="flex gap-2">
                  <input
                    name="coins"
                    type="number"
                    min={0}
                    max={99}
                    step={1}
                    defaultValue={4}
                    placeholder="코인"
                    className="flex-1 px-3 py-2 rounded-xl border border-black/10"
                    inputMode="numeric"
                    onWheel={(e) =>
                      (e.currentTarget as HTMLInputElement).blur()
                    } // 스크롤로 값 변하는 것 방지(선택)
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.value = String(clampInt(el.value, 0, 99));
                    }}
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-", "."].includes(e.key))
                        e.preventDefault();
                    }}
                  />
                  <Button type="submit" className="bg-emerald-500 text-white">
                    추가
                  </Button>
                </div>
              </form>
            </Card>

            {/* Progress chart */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold">7일 XP 추이</h2>
                <span className="text-sm opacity-70">일간 합계</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="xp" strokeWidth={3} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Sidebar: Badges + Shop */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-bold mb-3">뱃지</h2>
              <div className="flex flex-wrap gap-2">
                {BADGES.map((b) => {
                  const owned = state.badges.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      className={`px-3 py-2 rounded-xl border text-sm ${
                        owned
                          ? "bg-yellow-200 border-yellow-300"
                          : "bg-white border-black/10 opacity-60"
                      }`}
                    >
                      {b.name}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs opacity-70 mt-2">
                조건을 달성하면 자동으로 해금됩니다.
              </p>
            </Card>

            <Card>
              <h2 className="text-xl font-bold mb-3">상점</h2>
              <div className="text-sm opacity-70 mb-2">
                보유 코인:{" "}
                <strong className="text-slate-900">{state.coins}</strong>
              </div>
              <div className="space-y-2">
                {SHOP.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-black/10 bg-white"
                  >
                    <div>{item.name}</div>
                    <div className="flex items-center gap-2">
                      <Pill>{item.cost}💰</Pill>
                      <Button
                        className="bg-white"
                        disabled={state.coins < item.cost}
                        onClick={() => buy(item.cost)}
                      >
                        구매
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs opacity-70 mt-2">
                실제 보상은 스스로 실행해 주세요. 스스로에게 정당하게 보상하기!
              </p>
            </Card>

            <Card>
              <h2 className="text-xl font-bold mb-3">아카이브된 습관</h2>
              <div className="space-y-1 text-sm">
                {state.habits
                  .filter((h) => !h.active)
                  .map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between"
                    >
                      <span className="opacity-80">{h.name}</span>
                      <Button
                        className="bg-white"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            habits: prev.habits.map((x) =>
                              x.id === h.id ? { ...x, active: true } : x
                            ),
                          }))
                        }
                      >
                        복구
                      </Button>
                    </div>
                  ))}
                {state.habits.filter((h) => !h.active).length === 0 && (
                  <div className="opacity-60">보관된 항목이 없습니다.</div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs opacity-70">
          ⓘ 로컬 저장소(localStorage)에만 저장됩니다. 브라우저를 바꾸면 데이터가
          이동되지 않아요.
        </div>
      </div>
    </div>
  );
}
