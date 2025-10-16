"use client";
import HabitQuest from "@/components/HabitQuest";

export default function HabitPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-100 via-indigo-100 to-purple-200 text-slate-800">
      <h1 className="text-2xl font-bold mb-4">Habit Quest</h1>
      <HabitQuest />
    </div>
  );
}
