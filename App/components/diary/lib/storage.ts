export const DIARY_KEY = "diary_v1";
export const HQ_KEY = "habitQuest_v1";

/**
 * 오늘 첫 일기 저장 시 HabitQuest에 1회 보상을 지급
 * - XP +20, 코인 +8
 * - "일기 쓰기" 습관이 있으면 streak/lastDone/bestStreak 및 completions 갱신
 */
export function awardHabitQuestIfFirstOfDay({
  entriesTodayCountBeforeAdd,
  today,
}: {
  entriesTodayCountBeforeAdd: number;
  today: string;
}) {
  try {
    if (entriesTodayCountBeforeAdd !== 0) return; // 이미 오늘 쓴 일기가 있음

    const raw = localStorage.getItem(HQ_KEY);
    if (!raw) return;
    const state = JSON.parse(raw);

    state.totalXP = (state.totalXP || 0) + 20;
    state.coins = (state.coins || 0) + 8;

    // streak 반영
    const journal = (state.habits || []).find(
      (h: any) => h.name === "일기 쓰기" || h.id === "journal"
    );
    if (journal) {
      const lastDone = journal.lastDone;
      const lastDate = lastDone || "";
      const gap = (() => {
        if (!lastDate) return Number.NaN;
        const a = new Date(lastDate);
        const b = new Date(today);
        const ms = 24 * 60 * 60 * 1000;
        return Math.floor(
          (Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
            Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / ms
        );
      })();

      if (!lastDone) journal.streak = 1;
      else if (gap === 1) journal.streak = (journal.streak || 0) + 1;
      else if (gap > 1) journal.streak = 1;

      journal.lastDone = today;
      journal.bestStreak = Math.max(journal.bestStreak || 0, journal.streak || 0);

      state.completions = state.completions || {};
      const ids = new Set<string>(state.completions[today] || []);
      ids.add(journal.id);
      state.completions[today] = Array.from(ids);
    }

    localStorage.setItem(HQ_KEY, JSON.stringify(state));
  } catch {}
}
