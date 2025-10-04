//App/components/diary/lib/date.ts


// KST-friendly helpers
export const fmtDate = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const daysBetween = (aISO?: string, bISO?: string) => {
  if (!aISO || !bISO) return Number.NaN;
  const a = new Date(aISO);
  const b = new Date(bISO);
  const ms = 24 * 60 * 60 * 1000;
  return Math.floor(
    (Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
      Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / ms
  );
};
