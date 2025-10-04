import type { Metadata } from "next";
import "./globals.css";
import HeroHeader from "@/components/HeroHeader";

export const metadata: Metadata = {
  title: "HabitQuest",
  description: "꾸준함 기르기 미니게임",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900">
        <HeroHeader />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
