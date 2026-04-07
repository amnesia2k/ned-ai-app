export type HistoryGroupKey =
  | "Today"
  | "Yesterday"
  | "Previous 7 Days"
  | "Older";

export function groupDateLabel(input: string): HistoryGroupKey {
  const now = new Date();
  const date = new Date(input);

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const diffDays = Math.floor(
    (startOfToday.getTime() - startOfTarget.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays <= 7) {
    return "Previous 7 Days";
  }

  return "Older";
}
