# M2: デッキ & カード管理 — デッキCRUD + カード完全CRUD + Mermaid対応

> 状態: 🚧 進行中
> 対象期間: 目安 1〜2週間
> 依存: M1完了

---

## 概要

ユーザーが学習コンテンツを「デッキ」という単位で体系的に管理できるようにする。
デッキの作成・編集・削除と、カードの一覧・編集・削除を実装し、
カード作成時のデッキ選択を実データで動作させる。
Mermaid対応で技術ドキュメントの図解もカードに埋め込めるようにする。

---

## 含む機能・タスク

### デッキ管理 (データ層) ✅ 完了 (2026-04-21)

- [x] `src/lib/validations/deck.schema.ts` を作成
  - [x] createDeckSchema (name: 1-100文字, description: max500, icon: default "📘")
  - [x] updateDeckSchema
- [x] `src/lib/services/deck.ts` を作成
  - [x] `createDeck(userId, data)` 実装
  - [x] `getDecksByUser(userId)` — totalCards・dueCards付きの DeckWithStats
  - [x] `getDeckById(deckId, userId)` — 所有権検証付き・masteryDistribution付き
  - [x] `updateDeck(deckId, userId, data)` 実装
  - [x] `deleteDeck(deckId, userId)` 実装 (CASCADE DELETE は schema 設定済み)

### デッキ管理 (APIレイヤー) ✅ 完了 (2026-04-21)

- [x] `GET /api/decks` — ユーザーのデッキ一覧
- [x] `POST /api/decks` — デッキ作成
- [x] `GET /api/decks/[deckId]` — デッキ詳細
- [x] `PUT /api/decks/[deckId]` — デッキ更新
- [x] `DELETE /api/decks/[deckId]` — デッキ削除

### デッキ管理 (UIレイヤー) ✅ 完了 (2026-04-21)

- [x] `src/app/(app)/decks/page.tsx` — デッキ一覧 (totalCards・dueCards表示)
- [x] `src/app/(app)/decks/new/page.tsx` — デッキ作成フォーム
- [x] `src/app/(app)/decks/[deckId]/page.tsx` — デッキ詳細・カード一覧・習熟度分布
- [x] `src/app/(app)/decks/[deckId]/edit/page.tsx` — デッキ編集フォーム
- [x] `src/components/decks/DeckCard.tsx` — デッキ一覧の各デッキカード
- [x] `src/components/decks/DeckForm.tsx` — デッキ作成・編集共通フォーム (絵文字ピッカー含む)

### デッキ管理テスト ✅ 完了 (2026-04-21)

- [x] `tests/unit/lib/services/deck.test.ts` (9テスト: createDeck / getDecksByUser / getDeckById / updateDeck / deleteDeck)

### カード完全CRUD (データ層・API) ✅ 完了 (2026-04-21)

- [x] `src/lib/services/card.ts` に追加済み
  - [x] `getCardsByDeck(userId, deckId)` — 全件取得
  - [x] `updateCard(userId, cardId, data)` — 所有権検証付き
  - [x] `deleteCard(userId, cardId)` — 所有権検証付き
- [x] `GET /api/cards?deckId=` — デッキ別カード一覧 (デッキ詳細ページからサービス直呼び)
- [x] `GET /api/cards/[cardId]` — カード詳細取得
- [x] `PATCH /api/cards/[cardId]` — カード更新
- [x] `DELETE /api/cards/[cardId]` — カード削除 (204 No Content)

### カード完全CRUD (UI) ✅ 完了 (2026-04-21)

- [x] `src/app/(app)/cards/[cardId]/edit/page.tsx` — カード編集ページ (Server Component)
- [x] `src/components/cards/CardActions.tsx` — 編集リンク・削除ボタン (Client Component)
- [x] CardEditor に編集モード (`mode='edit'`, `defaultValues`, `cardId`) を追加
- [x] デッキ詳細カード一覧に CardActions を組み込み (編集リンク + confirm付き削除)

### Mermaid対応

- [ ] `mermaid` パッケージをインストール (`mermaid@^11.x`)
- [ ] `src/components/cards/MermaidRenderer.tsx` を作成
  - [ ] `next/dynamic` でクライアントサイドのみロード (SSRで例外になるため)
  - [ ] コードブロック ` ```mermaid ``` ` を検出して MermaidRenderer に渡す
- [ ] CardPreview の react-markdown に MermaidRenderer を統合

### ダッシュボードへの動線

- [ ] `src/app/(app)/dashboard/page.tsx` の最小実装 (今日の復習カード枚数表示のみ)
  - 復習セッション本体はM3で実装するが、ナビゲーション起点としてページを作る
- [x] AppNav にデッキ一覧へのリンクを追加 (2026-04-21)
- [ ] AppNav にダッシュボードへのリンクを追加

### 品質チェック

- [x] `npm run lint` がパスする
- [x] `npm run typecheck` がパスする
- [x] `npm test` がパスする
- [x] `npm run build` がパスする

---

## 受け入れ条件

- [x] デッキを作成・編集・削除できる
- [x] デッキ一覧でカード枚数・今日の復習予定枚数が表示される
- [x] デッキ詳細でカード一覧と習熟度分布が表示される
- [x] カードを編集・削除できる
- [x] カード作成フォームのデッキ選択に実際のデッキが表示される
- [ ] Mermaidダイアグラムがカードプレビューで描画される
- [x] デッキ削除時にカード・ReviewLogが連動削除される (CASCADE)
- [x] 他ユーザーのデッキへのアクセスが404で弾かれる

---

## KPI貢献

| KPI | 貢献内容 | 計測方法 |
|-----|---------|---------|
| カード作成数 50枚以上/月 | デッキ管理によりコンテンツ整理が容易になり作成継続率が向上 | Prismaのカード作成数集計 |
| 7日間継続率 | デッキという「整理の器」により学習習慣が定着しやすくなる | MAU追跡 |

---

## 技術的前提条件・依存

| 種別 | 内容 | 備考 |
|------|------|------|
| 前提マイルストーン | M1: 基盤構築 | 認証・Prismaスキーマ・カード作成基盤が必要 |
| 外部サービス | Supabase PostgreSQL | Deck / Card テーブルへのデータ書き込み |

---

## 実装メモ

- Mermaid.js はSSRで `window` 未定義エラーになるため `next/dynamic({ ssr: false })` が必須
- カード一覧のページネーションは cursor-based を採用 (architecture.md の方針に従い `nextCursor` を返す)
- デッキ削除の CASCADE は `prisma/schema.prisma` の `onDelete: Cascade` で設定済み
- `DeckWithStats` は Prisma の `_count` + サブクエリで今日の復習予定枚数を集計する

---

## リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| Mermaidバンドルサイズが大きい (~2MB) | 中 | `next/dynamic` で遅延ロード必須。Mermaidを含むページのみロード |
| カード削除時の意図しない連鎖削除 | 高 | UIで「デッキを削除すると○枚のカードも削除されます」の確認ダイアログを表示 |
