"use client";
import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

type Props = {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  maxChars?: number;
};

export default function LinedDiaryEditor({
  value = "",
  onChange,
  placeholder = "오늘의 하이라이트, 감사한 일, 배운 점…",
  maxChars = 0,
}: Props) {
  // 👇 서버에서 그리지 말고 클라에서만 초기 렌더
  const editor = useEditor({
    content: value,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxChars || null }),
    ],
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "diary-paper font-diary caret-rose-500 selection:bg-yellow-200/60 " +
          "min-h-[50vh] text-[1.35rem] leading-[2.2rem] px-8 md:px-12 py-8 " +
          "rounded-2xl bg-[#fffdf8]/90 border border-amber-900/10 shadow-sm max-w-none",
      },
    },
    /** 👇 핵심 */
    immediatelyRender: false,
  });

  // (보호) 빌드/전환 중 SSR 환경이면 아무것도 안 그림
  if (typeof window === "undefined") return null;

  useEffect(() => () => editor?.destroy(), [editor]);
  if (!editor) return null;

  const B = (active: boolean) =>
    `px-2 py-1 rounded text-sm border border-black/10 ${active ? "bg-black/10" : "bg-white hover:bg-black/5"}`;

  return (
    <div className="rounded-2xl bg-white/70 border border-black/10 overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-black/10">
        <button className={B(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button className={B(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button className={B(editor.isActive("underline"))} onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
        <button className={B(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button className={B(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button className={B(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</button>
        <button className={B(false)} onClick={() => {
          const url = prompt("링크 URL");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}>Link</button>
        <button className={B(false)} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>Clear</button>
      </div>
      <div className="p-3 md:p-4">
        <EditorContent editor={editor} />
        <div className="mt-2 text-xs text-black/50">
          {editor.storage.characterCount.characters()} chars{maxChars ? ` / ${maxChars}` : ""} · {editor.storage.characterCount.words()} words
        </div>
      </div>
    </div>
  );
}
