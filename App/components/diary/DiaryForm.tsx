//App/components/diary/DiaryForm.tsx

"use client";
import React, { useEffect, useState } from "react";
import type { DiaryEntryUI, Mood } from "@/components/diary/type/diary";
import { Card, Button } from "@/components/diary/ui/atoms";

type FormPayload = {
  date: string;
  title: string;
  content: string;
  mood: Mood;
  locationName: string;
};

type Props = {
  initialDate: string;                 // 기본 date 값 (보통 오늘)
  editing?: DiaryEntryUI | null;         // 수정 중인 아이템
  onSubmit: (payload: FormPayload) => void;
  onCancelEdit?: () => void;
};

const moods: Mood[] = ["HAPPY", "PROUD", "FOCUSED", "NEUTRAL", "TIRED", "SAD"];

export default function DiaryForm({
  initialDate,
  editing = null,
  onSubmit,
  onCancelEdit,
}: Props) {
  const [date, setDate] = useState(initialDate);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood>("NEUTRAL");
  const [locationName, setLocationName] = useState("");

  // editing이 바뀔 때 폼 채우기
  useEffect(() => {
    if (editing) {
      setDate(editing.date);
      setTitle(editing.title);
      setContent(editing.content);
      setMood(editing.mood);
      setLocationName(editing.location || "");
      // 스크롤 위로
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // 새 작성 모드
      setDate(initialDate);
      setTitle("");
      setContent("");
      setMood("NEUTRAL");
      setLocationName("");
    }
  }, [editing, initialDate]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    onSubmit({
      date,
      title: title.trim(),
      content: content.trim(),
      mood,
      locationName: locationName.trim(),
    });
    // 새 작성으로 초기화 (수정 완료 후도 동일 처리)
    setTitle("");
    setContent("");
    setLocationName("");
    setMood("NEUTRAL");
    setDate(initialDate);
  };

  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="md:col-span-2 px-3 py-2 rounded-xl border border-black/10"
        />
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value as Mood)}
          className="px-3 py-2 rounded-xl border border-black/10"
        >
          {moods.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="장소 (선택)"
          className="px-3 py-2 rounded-xl border border-black/10"
        />
        <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="md:col-span-2 px-3 py-2 rounded-xl border border-black/10"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 적어보세요..."
            rows={4}
            className="md:col-span-4 px-3 py-2 rounded-xl border border-black/10"
          />
        </div>
        <div className="md:col-span-6 flex items-center gap-2">
          <Button type="submit" className="bg-emerald-500 text-white">
            {editing ? "수정 완료" : "저장"}
          </Button>
          {editing && (
            <Button className="bg-white" onClick={onCancelEdit}>
              취소
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
