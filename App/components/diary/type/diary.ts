// App/components/diary/type/diary.ts

// ✅ 프론트(UI) 전용 타입
export type Mood = "HAPPY"|"NEUTRAL"|"TIRED"|"SAD"|"PROUD"|"FOCUSED";

export type DiaryEntryUI = {
  id: string;
  date: string;              // YYYY-MM-DD (UI 전용 파생값)
  title: string;
  content: string;
  mood: Mood;
  location?: string;         // UI 전용
  createdAt: string;         // ISO
  updatedAt: string;         // ISO
  weather?: string;
  temperatureC?: number;     // camelCase
};

// ✅ 서버 응답(VO 직렬화) 타입 예시 — snake_case 포함
export type ApiDiaryRes = {
  id: number;
  usrId: number;
  title: string;
  content: string;
  mood: string;
  createdAt: string;
  updatedAt: string;
  weather?: string;
  temperature_c?: number;    // snake_case
};

// ✅ 서버 → 프론트(UI) 변환
export const fromApi = (a: ApiDiaryRes): DiaryEntryUI => ({
  id: String(a.id),
  date: a.createdAt.slice(0, 10),
  title: a.title,
  content: a.content,
  mood: (a.mood as Mood) ?? "NEUTRAL",
  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
  weather: a.weather,
  temperatureC: a.temperature_c,
});
