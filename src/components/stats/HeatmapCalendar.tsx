import type { HeatmapEntry } from '@/lib/services/stats';

interface HeatmapCalendarProps {
  heatmap: HeatmapEntry[];
}

function getCellColor(count: number): string {
  if (count === 0) return 'bg-gray-100';
  if (count <= 2) return 'bg-blue-200';
  if (count <= 5) return 'bg-blue-400';
  return 'bg-blue-600';
}

/**
 * 直近30日の活動量をヒートマップ形式で表示するカレンダーコンポーネント。
 */
export default function HeatmapCalendar({ heatmap }: HeatmapCalendarProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {heatmap.map((entry, i) => {
          const showLabel = i === 0 || i % 7 === 0;
          const labelDate = new Date(entry.date + 'T00:00:00');
          const label = showLabel
            ? `${labelDate.getMonth() + 1}/${labelDate.getDate()}`
            : '';
          return (
            <div key={entry.date} className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400 h-4 leading-4">{label}</span>
              <div
                className={`w-7 h-7 rounded-sm ${getCellColor(entry.count)}`}
                title={`${entry.date}: ${entry.count}回`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
        <span>少</span>
        <div className="w-4 h-4 rounded-sm bg-gray-100" />
        <div className="w-4 h-4 rounded-sm bg-blue-200" />
        <div className="w-4 h-4 rounded-sm bg-blue-400" />
        <div className="w-4 h-4 rounded-sm bg-blue-600" />
        <span>多</span>
      </div>
    </div>
  );
}
