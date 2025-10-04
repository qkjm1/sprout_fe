//App/components/diary/DiaryList.tsx
 
"use client";
import React from "react";
import { motion } from "framer-motion";
import type { DiaryEntryUI } from "@/components/diary/type/diary";
import { Pill, Button } from "@/components/diary/ui/atoms";

type Props = {
  items: DiaryEntryUI[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function DiaryList({ items, onEdit, onDelete }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-sm opacity-70">
        작성된 일기가 없습니다. 오늘의 기록을 남겨보세요!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((e) => (
        <motion.div
          key={e.id}
          layout
          className="p-4 rounded-2xl border border-black/10 bg-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill>{e.date}</Pill>
              <Pill>{e.mood}</Pill>
              {e.location && <Pill>📍 {e.location}</Pill>}
            </div>
            <div className="flex items-center gap-2">
              <Button className="bg-white" onClick={() => onEdit(e.id)}>
                수정
              </Button>
              <Button className="bg-white" onClick={() => onDelete(e.id)}>
                삭제
              </Button>
            </div>
          </div>
          {e.title && (
            <div className="mt-2 font-semibold text-lg">{e.title}</div>
          )}
          {e.content && (
            <div className="mt-1 whitespace-pre-wrap leading-relaxed">
              {e.content}
            </div>
          )}
          <div className="mt-2 text-xs opacity-60">
            작성 {new Date(e.createdAt).toLocaleString()} · 수정{" "}
            {new Date(e.updatedAt).toLocaleString()}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
