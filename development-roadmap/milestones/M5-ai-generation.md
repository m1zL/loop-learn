# M5: AI問題自動生成 — Gemini API連携 + カード一括生成UI

> 状態: ✅ 完了 (2026-04-25)
> 対象期間: 目安 1〜2週間
> 依存: M2完了 (デッキ管理が必要)

---

## 概要

Gemini 2.0 Flash APIを使ってテキストブロックから Q&A カードを自動生成する機能を実装する。
ユーザーが書籍の1節やドキュメントを貼り付けるだけで、5〜10問のカードが30秒以内に生成される。
生成されたカードは編集・削除・追加してから一括保存できる。

---

## 含む機能・タスク

### AIサービス (データ層)

- [x] `@google/generative-ai` パッケージをインストール (`^0.x.x`)
- [x] `src/lib/services/ai.ts` を作成 (当初 `ai-generator.ts` 予定から変更)
  - [x] `generateCards(text, domain)` 実装
    - [x] systemInstruction でユーザー入力とプロンプトを分離 (プロンプトインジェクション対策)
    - [x] レスポンスは構造化JSON (GeneratedCard[]) を要求
    - [x] 不正エントリのフィルタリング (malformed JSON 対策)
  - [x] Domain 型定義 (frontend / backend / infra / algorithm / os / network / database / security / general)
  - [x] GeneratedCard 型定義 (front, back)
- [x] `src/lib/validations/ai.schema.ts`
  - [x] generateCardsSchema (text: min10/max5000, domain: enum, deckId: cuid)

### Gemini APIレート制限

- [x] ~~`src/lib/rate-limit.ts` を作成~~ (技術的判断: route.ts 内で 429/quota エラーを検知して返す方式に変更)

### AIカード生成API

- [x] `POST /api/ai/generate` — テキスト → カード生成
  - [x] 認証検証
  - [x] `generateCards` 呼び出し
  - [x] `maxDuration = 60` で Vercel タイムアウト延長
  - [x] 429/quota エラーハンドリング

### AIカード生成UI

- [x] `src/components/ai/GenerateForm.tsx` を作成
  - [x] テキストエリア (max5000文字・文字数カウンター付き)
  - [x] ドメイン選択セレクト (9種類)
  - [x] デッキ選択セレクト
  - [x] 生成ボタン (ローディング中は disabled + スピナー)
- [x] `src/components/ai/GeneratedCardItem.tsx` を作成
  - [x] front/back インライン編集 + 削除ボタン
- [x] `src/components/ai/GeneratedCardList.tsx` を作成
  - [x] 生成されたカードの一覧表示 + 並列保存
- [x] `src/app/(app)/ai/generate/page.tsx` — AI生成ページ (パス変更: `/cards/generate` → `/ai/generate`)

### テスト

- [x] `tests/unit/lib/services/ai.test.ts`
  - [x] 正常系・フィルタリング・GEMINI_API_KEY 未設定エラーをテスト (3件)

### 品質チェック

- [x] `npm run lint` がパスする
- [x] `npm run typecheck` がパスする
- [x] `npm test` がパスする

---

## 受け入れ条件

- [ ] テキストを入力してドメインを選択すると5〜10枚のカードが30秒以内に生成される
- [ ] 生成されたカードを編集・削除・追加してから一括保存できる
- [ ] `GEMINI_API_KEY` なしの場合はエラーメッセージが表示される
- [ ] レート制限超過時に429エラーが返りUIに「しばらく待ってから試してください」が表示される
- [ ] `GEMINI_API_KEY` はサーバーサイドのみで使用されクライアントに露出しない

---

## KPI貢献

| KPI | 貢献内容 | 計測方法 |
|-----|---------|---------|
| カード作成数 50枚以上/月 | AI生成でカード作成の摩擦を大幅に削減 | AI生成経由のCard作成数 |
| MAU 500人 | AI生成機能が差別化要因となりユーザー獲得・口コミに貢献 | MAU推移 |

---

## 技術的前提条件・依存

| 種別 | 内容 | 備考 |
|------|------|------|
| 前提マイルストーン | M2: デッキ & カード管理 | 生成カードの保存先デッキが必要 |
| 外部サービス | Gemini API (2.0 Flash) | `GEMINI_API_KEY` が必要 |
| 環境変数 | `GEMINI_API_KEY` | Google AI Studio で取得 |

---

## 実装メモ

- Gemini API のプロンプトは `systemInstruction` でシステム部分を分離し、`contents` にユーザーテキストを渡す。1つのプロンプトに混在させない (architecture.md セキュリティ要件)
- Vercel の Serverless Functions はデフォルト10秒タイムアウト。AI生成は `next.config.ts` で `maxDuration: 60` に設定する必要がある
- インメモリのレート制限は Vercel の複数インスタンス環境では機能しない。MVP段階では許容し、スケールアウト時に Redis/Upstash に移行する
- 生成カードのZod検証は必須。LLMのレスポンスは型保証がないため、パース失敗時は適切なエラーメッセージを返す

---

## リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| Gemini APIのレート制限 (15RPM) 到達 | 中 | ユーザー単位の1RPM制限でAPIコストと枠を保護 |
| LLMの生成品質 (的外れな問題) | 中 | systemInstructionを丁寧に設計し、UIでユーザーが必ず編集できるフローにする |
| APIキー漏洩 | 高 | サーバーサイドのみで使用・環境変数名に `NEXT_PUBLIC_` を付けない |
