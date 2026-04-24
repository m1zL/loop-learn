interface MasteryDistributionProps {
  distribution: {
    unlearned: number;
    learning: number;
    mastered: number;
  };
  total: number;
}

/**
 * カードの習熟度分布を横棒グラフで表示するコンポーネント。
 */
export default function MasteryDistribution({ distribution, total }: MasteryDistributionProps) {
  const { unlearned, learning, mastered } = distribution;
  const safeTotal = total > 0 ? total : 1;

  const unlearnedPct = (unlearned / safeTotal) * 100;
  const learningPct = (learning / safeTotal) * 100;
  const masteredPct = (mastered / safeTotal) * 100;

  return (
    <div>
      {/* 横棒グラフ */}
      <div className="flex h-4 rounded-full overflow-hidden mb-3">
        {unlearned > 0 && (
          <div
            className="bg-gray-300"
            style={{ width: `${unlearnedPct}%` }}
            title={`未学習: ${unlearned}枚`}
          />
        )}
        {learning > 0 && (
          <div
            className="bg-orange-400"
            style={{ width: `${learningPct}%` }}
            title={`学習中: ${learning}枚`}
          />
        )}
        {mastered > 0 && (
          <div
            className="bg-green-500"
            style={{ width: `${masteredPct}%` }}
            title={`習得済み: ${mastered}枚`}
          />
        )}
        {total === 0 && <div className="bg-gray-100 w-full" />}
      </div>

      {/* 凡例 */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />
            <span className="text-xs text-gray-500">未学習</span>
          </div>
          <p className="font-semibold text-gray-700">{unlearned}</p>
          <p className="text-xs text-gray-400">{unlearnedPct.toFixed(0)}%</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <span className="w-3 h-3 rounded-full bg-orange-400 inline-block" />
            <span className="text-xs text-gray-500">学習中</span>
          </div>
          <p className="font-semibold text-orange-600">{learning}</p>
          <p className="text-xs text-gray-400">{learningPct.toFixed(0)}%</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            <span className="text-xs text-gray-500">習得済み</span>
          </div>
          <p className="font-semibold text-green-600">{mastered}</p>
          <p className="text-xs text-gray-400">{masteredPct.toFixed(0)}%</p>
        </div>
      </div>
    </div>
  );
}
