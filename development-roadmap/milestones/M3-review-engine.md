# M3: 復習エンジン — SM-2フル実装 + 復習セッションUI

> 状態: ✅ 完了 (2026-04-24)
> 対象期間: 目安 1〜2週間
> 依存: M2完了 (デッキ・カードデータが必要)

---

## 概要

SM-2アルゴリズムの完全実装と、カードをフリップして自己評価する復習セッションUIを実装する。
今日の復習カードを自動スケジューリングし、ユーザーが隙間時間に効率よく復習できる体験を提供する。
このマイルストーンの完了でloop-learnのコア価値（間隔反復による記憶定着）が動作するようになる。

---

## 含む機能・タスク

### SM-2サービス (データ層)

- [x] `src/lib/services/sm2.ts` を作成
  - [x] `SM2Service.calculate(card, rating)` 実装
    - [x] Rating 1 (全然わからない): repetitions=0, interval=1, ΔEF=-0.20 (min 1.3)
    - [x] Rating 2 (うっすら): repetitions=0, interval=1, ΔEF=-0.10
    - [x] Rating 3 (わかった): repetitions+1, interval計算 (rep=0→1, rep=1→6, rep≥2→round(prev×EF))
    - [x] Rating 4 (完璧): Rating3と同計算, ΔEF=+0.10 (max 2.5)
    - [x] nextReviewDate = today + interval日 (時刻は00:00:00に正規化)
  - [x] SM2Result 型定義 (easeFactor, interval, repetitions, nextReviewDate)
- [x] `src/lib/validations/review.schema.ts`
  - [x] reviewCardSchema (rating: z.number().int().min(1).max(4))

### 復習サービス (データ層)

- [x] `src/lib/services/review.ts` を作成
  - [x] `reviewCard(userId, cardId, rating)` 実装
    - [x] getCardById で所有権検証 (null なら即 return null)
    - [x] SM2Service.calculate を呼び出し
    - [x] Card の SM-2パラメータを更新 (easeFactor / interval / repetitions / nextReviewDate)
    - [x] ReviewLog を作成 (previousInterval / newInterval / rating / reviewedAt)
    - [x] トランザクション処理 (Card更新とReviewLog作成をアトミックに)
  - [x] `getTodayReviewCards(userId, deckId?)` — `nextReviewDate <= today` のカードを取得
  - [x] ~~`getSessionSummary(userId, sessionDate)`~~ (URLパラメータでサマリー渡しに実装変更したため不要)

### 復習API (APIレイヤー)

- [x] `GET /api/review/today` — 今日の復習カード一覧 (deckIdクエリパラメータ対応)
- [x] `POST /api/cards/[cardId]/review` — 自己評価送信 → SM-2計算 → Card + ReviewLog更新

### 復習セッションUI

- [x] `src/components/review/ReviewCard.tsx` — CSS transform (rotateY) フリップUI
- [x] `src/components/review/RatingButtons.tsx` — 4段階自己評価ボタン（答え面確認後のみ表示）
- [x] `src/components/review/SessionProgress.tsx` — 残り枚数・完了枚数・プログレスバー
- [x] `src/components/review/ReviewSession.tsx` — セッション全体の状態管理 (Client Component)
- [x] `src/app/(app)/review/page.tsx` — RSCで初期カード取得・セッション開始
- [x] `src/app/(app)/review/summary/page.tsx` — 復習枚数・平均評価表示

### ダッシュボード更新

- [x] `src/app/(app)/dashboard/page.tsx` — 「復習を始める」ボタンを /review リンクに変更

### テスト

- [x] `tests/unit/lib/services/sm2.test.ts` (12ケース・100%カバレッジ)
- [x] `tests/unit/lib/services/review.test.ts` (3ケース)
- [x] `tests/unit/lib/services/card.test.ts` — getTodayReviewCards テスト4ケース追加

### 品質チェック

- [x] `npm run lint` がパスする
- [x] `npm run typecheck` がパスする
- [x] `npm test` がパスする (49テスト全通過)

---

## 受け入れ条件

- [x] 今日の復習予定カードがダッシュボードに表示される
- [x] 復習セッションで問題面→答え面のフリップができる
- [x] 4段階の自己評価を送信すると SM-2 で次回復習日が更新される
- [x] セッション終了時に復習枚数・平均評価が表示される
- [x] SM-2 テストが 100% カバレッジでパスする
- [x] 期限切れカードが優先表示される

---

## KPI貢献

| KPI | 貢献内容 | 計測方法 |
|-----|---------|---------|
| 7日間継続率 40%以上 | 毎日の復習スケジュールが自動生成され継続動機が生まれる | 7日後のアクティブユーザー割合 |
| 平均セッション数 週4回以上 | 今日の復習カードが常に表示されることで訪問動機が生まれる | WeeklyActiveUsers / UniqueUsers |
| 復習完了率 70%以上 | SM-2による正確なスケジューリングで無理のない復習量を維持 | ReviewLog件数 / スケジュール件数 |

---

## 技術的前提条件・依存

| 種別 | 内容 | 備考 |
|------|------|------|
| 前提マイルストーン | M2: デッキ & カード管理 | 復習するカードデータが必要 |
| 外部サービス | Supabase PostgreSQL | ReviewLog テーブルへの書き込み |

---

## 実装メモ

- SM-2 の `nextReviewDate` は時刻を `00:00:00` に正規化してから保存 (タイムゾーン問題を避けるため)
- ReviewLog 作成と Card 更新は Prisma の `$transaction` でアトミックに処理すること
- カードフリップアニメーションは `transform: rotateY(180deg)` + `backface-visibility: hidden` のCSS実装。JSでレイアウトを操作しない (architecture.md の16ms要件)
- セッション中断状態はローカルステート (sessionStorage) で管理。永続化不要

---

## リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| SM-2計算の境界値バグ | 高 | 全Rating・全パラメータ組み合わせのユニットテストを必須化 |
| セッション中のネットワーク切断 | 中 | submitReview が失敗した場合はリトライUIを表示。ReviewLogが重複しないよう冪等性を確認 |
