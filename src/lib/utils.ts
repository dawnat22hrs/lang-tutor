export const levenshtein = (a: string, b: string): number => {
  const m = a.length, n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[n];
};

export const spellCheckScore = (userText: string, targetWord: string): number => {
  const words = userText.toLowerCase().trim().split(/\s+/);
  const target = targetWord.toLowerCase();
  return Math.min(...words.map((w) => levenshtein(w, target)));
};

export const computeStreak = (dates: string[]): number => {
  if (!dates.length) return 0;
  const days = [...new Set(dates.map((d) => d.split("T")[0]))].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  let cursor = today;
  for (const day of days) {
    if (day === cursor) {
      streak++;
      const d = new Date(cursor);
      d.setDate(d.getDate() - 1);
      cursor = d.toISOString().split("T")[0];
    } else break;
  }
  return streak;
};
