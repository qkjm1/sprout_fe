"use client";
import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";


const STORAGE_KEY = "habitQuest_v1";


type Habit = { id: string; xp: number; coins: number; name: string };


type SaveState = {
habits: Habit[];
completions: Record<string, string[]>;
totalXP: number; coins: number; badges: string[];
};


const fmtDate = (d = new Date()) => {
const y = d.getFullYear();
const m = String(d.getMonth() + 1).padStart(2, "0");
const day = String(d.getDate()).padStart(2, "0");
return `${y}-${m}-${day}`;
};


export default function StatsPage() {
const [s, setS] = useState<SaveState | null>(null);
useEffect(() => {
try {
const raw = localStorage.getItem(STORAGE_KEY);
if (raw) setS(JSON.parse(raw));
} catch {}
}, []);


const chartData = useMemo(() => {
if (!s) return [] as { day: string; xp: number }[];
const arr: { day: string; xp: number }[] = [];
for (let i = 6; i >= 0; i--) {
const d = new Date(); d.setDate(d.getDate() - i);
const key = fmtDate(d);
const ids = s.completions[key] || [];
const xp = ids.map(id => s.habits.find(h => h.id === id)?.xp || 0).reduce((a,b)=>a+b,0);
arr.push({ day: key.slice(5), xp });
}
return arr;
}, [s]);


if (!s) return <div className="p-6">로딩 중…</div>;


return (
<div className="mx-auto max-w-4xl p-6">
<h1 className="text-2xl font-extrabold">📊 통계</h1>
<p className="text-sm opacity-70 mt-1">이 브라우저에 저장된 최근 활동을 요약해 보여줍니다.</p>


<div className="grid sm:grid-cols-3 gap-3 mt-6">
<div className="p-4 rounded-2xl border bg-white/80"><div className="opacity-70 text-sm">총 XP</div><div className="text-2xl font-bold">{s.totalXP}</div></div>
<div className="p-4 rounded-2xl border bg-white/80"><div className="opacity-70 text-sm">보유 코인</div><div className="text-2xl font-bold">{s.coins}</div></div>
<div className="p-4 rounded-2xl border bg-white/80"><div className="opacity-70 text-sm">해금 뱃지</div><div className="text-2xl font-bold">{s.badges.length}</div></div>
</div>


<div className="mt-6 p-4 rounded-2xl border bg-white/80">
<div className="font-semibold mb-2">최근 7일 XP 추이</div>
<div className="h-64">
<ResponsiveContainer width="100%" height="100%">
<LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="day" />
<YAxis allowDecimals={false} />
<Tooltip />
<Line type="monotone" dataKey="xp" strokeWidth={3} dot />
</LineChart>
</ResponsiveContainer>
</div>
</div>


<div className="mt-6 p-4 rounded-2xl border bg-white/80">
<div className="font-semibold mb-2">습관 목록</div>
<ul className="grid sm:grid-cols-2 gap-2 text-sm">
{s.habits.map(h => (
<li key={h.id} className="p-3 rounded-xl border bg-white">{h.name} · +{h.xp} XP · +{h.coins} 코인</li>
))}
</ul>
</div>
</div>
);
}