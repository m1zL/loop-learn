import type { HeatmapEntry } from '@/lib/services/stats';

interface WeeklyBarProps {
  heatmap: HeatmapEntry[];
}

/**
 * 直近4週の週別復習回数を縦棒グラフで表示するコンポーネント。
 * ヒートマップデータを7日ごとに集計して表示する。
 */
export default function WeeklyBar({ heatmap }: WeeklyBarProps) {
  // 7日ごとに集計（直近4週。28日分を想定するが30日分のデータから末尾28日を使用）
  const recentDays = heatmap.slice(-28);
  const weeks: { label: string; count: number }[] = [];
  for (let w = 0; w < 4; w++) {
    const weekDays = recentDays.slice(w * 7, (w + 1) * 7);
    if (weekDays.length === 0) continue;
    const count = weekDays.reduce((sum, d) => sum + d.count, 0);
    const firstDay = weekDays[0];
    const label = firstDay ? firstDay.date.slice(5) : ''; // 'MM-DD'
    weeks.push({ label, count });
  }

  const maxCount = Math.max(...weeks.map((w) => w.count), 1);

  return (
    <div className="flex items-end gap-3 h-24">
      {weeks.map((week, i) => {
        const heightPct = (week.count / maxCount) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-gray-500">{week.count}</span>
            <div className="w-full flex items-end" style={{ height: '60px' }}>
              <div
                className="w-full bg-blue-400 rounded-t transition-all"
                style={{ height: `${Math.max(heightPct, 4)}%` }}
                title={`${week.label}〜 : ${week.count}回`}
              />
            </div>
            <span className="text-xs text-gray-400">{week.label}</span>
          </div>
        );
      })}
    </div>
  );
}
