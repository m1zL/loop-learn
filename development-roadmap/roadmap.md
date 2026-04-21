# 開発ロードマップ

> 最終更新: 2026-04-21
> ベースドキュメント: docs/product-requirements.md, docs/architecture.md, docs/functional-design.md

---

## プロダクト概要

**loop-learn** — アクティブリコール × 間隔反復で学びを定着させる学習ツール。
webエンジニアが書籍や技術ドキュメントから得た知識を科学的学習法で長期記憶に転換する。

---

## 現在地

### 実装済み機能

- [x] **プロジェクト初期化** — Next.js 15 / React 19 / TypeScript / Tailwind CSS 4 / Prisma 6 の初期構成 (`.steering/20260415-学習カード作成`)
- [x] **Prismaスキーマ** — User / Deck / Card (SM-2パラメータ) / ReviewLog / NextAuth用モデル + インデックス
- [x] **型定義・バリデーション** — `src/types/`, `src/lib/validations/card.schema.ts` (Zod)
- [x] **カード作成API** — `POST /api/cards` (認証検証 → Zodバリデーション → 所有権チェック → SM-2初期値設定)
- [x] **カード作成UI** — CardEditor (4タイプ), CardPreview (Markdownレンダリング + cloze変換), TagInput
- [x] **Google OAuth認証** — NextAuth.js v5, ログインページ, セッション管理, 型拡張 (`.steering/20260415-認証`)
- [x] **認証ガード** — `(app)/layout.tsx` による全ページ一括保護, AppNav (ユーザー情報 + サインアウト)
- [x] **ランディングページ** — 未認証時のサービス紹介 + Googleログインボタン
- [x] **GitHub Actions CI** — lint / typecheck / test / build の自動チェック (`.steering/20260421-CIパイプライン構築`)
- [x] **デッキCRUD** — デッキ一覧・作成・詳細・編集 / DeckService / GET・POST /api/decks・GET・PUT・DELETE /api/decks/[deckId] / ユニットテスト 9件 (`.steering/20260421-デッキCRUD`)
- [x] **カード一覧/編集/削除** — updateCard・deleteCard / GET・PATCH・DELETE /api/cards/[cardId] / CardEditor 編集モード / CardActions / ユニットテスト 4件追加 (計30件) (`.steering/20260421-カード一覧編集削除`)

### 進行中

- 🚧 **M2残タスク** — Mermaid対応、ダッシュボードスタブ

---

## マイルストーン一覧

| # | マイルストーン | 主な機能 | KPI貢献 | 状態 |
|---|--------------|---------|---------|------|
| M1 | 基盤構築 | プロジェクト初期化・認証・カード作成基盤・CI | セキュリティ基盤 | ✅ 完了 |
| M2 | デッキ & カード管理 | デッキCRUD・カード一覧/編集/削除・Mermaid対応 | カード作成数 (50枚/月) | 🚧 進行中 |
| M3 | 復習エンジン | SM-2フル実装・復習セッションUI・自己評価 | 7日継続率・復習完了率・セッション数 | ⬜ 未着手 |
| M4 | 学習進捗ダッシュボード | ヒートマップ・ストリーク・習熟度分布・週次グラフ | 7日継続率・NPS | ⬜ 未着手 |
| M5 | AI問題自動生成 | Gemini API連携・カード一括生成UI・ドメイン指定 | MAU・カード作成数 | ⬜ 未着手 |

---

## マイルストーン依存関係

```
M1: 基盤構築 (認証・カード作成基盤)
  └── M2: デッキ & カード管理
        ├── M3: 復習エンジン
        │     └── M4: 学習進捗ダッシュボード
        └── M5: AI問題自動生成  ← M2完了後に独立して着手可能
```

> M3とM5は依存関係がないため並行開発が可能。ただしM4はM3の復習ログデータが必要。

---

## KPI対応表

| KPI | 対応マイルストーン | 達成条件 |
|----|-----------------|---------|
| MAU 500人 (6ヶ月後) | M1〜M5 全体 | フルMVP機能リリース後のユーザー獲得 |
| 7日間継続率 40%以上 | M3・M4 | 復習セッション + ダッシュボードによる習慣形成 |
| 平均セッション数 週4回以上 | M3 | 毎日の復習スケジュール通知・今日の復習カード表示 |
| カード作成数 50枚以上/月 | M2・M5 | デッキ管理の使いやすさ + AI自動生成 |
| 復習完了率 70%以上 | M3 | SM-2の正確なスケジューリング + 期限切れカード優先表示 |
| NPS 30以上 | M4 | 学習成果の可視化によるモチベーション向上 |

---

## 技術的前提条件・外部依存

| 依存先 | 用途 | 影響するマイルストーン | 備考 |
|--------|------|---------------------|------|
| Supabase PostgreSQL | メインDB | M1〜 | `DATABASE_URL` / `DIRECT_URL` が必要 |
| Google OAuth | ソーシャルログイン | M1 | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` |
| NextAuth.js v5 | セッション管理 | M1〜 | `NEXTAUTH_SECRET` / `NEXTAUTH_URL` |
| Vercel | ホスティング | M1〜 | 環境変数はVercelダッシュボードで設定 |
| Gemini API (2.0 Flash) | AI問題自動生成 | M5〜 | `GEMINI_API_KEY`、無料枠15RPM・100万トークン/日 |

---

## リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| Supabase無料枠の接続数上限 (10接続) | 高 | Prismaコネクションプーリング設定 (max: 10) |
| NextAuth v5 ベータ版の破壊的変更 | 中 | バージョンを `5.0.0-beta.31` に固定し、アップデート時はリリースノートを確認 |
| Gemini API レート制限 (15RPM) | 中 | ユーザー単位で1リクエスト/分に制限。超過時は429エラーをUIで表示 |
| SM-2スケジュール計算の精度 | 高 | アルゴリズムを100%テストカバレッジ必須とし、境界値テストを充実させる |
| Mermaid.jsのバンドルサイズ増大 | 低 | `next/dynamic` で動的インポートし、Mermaidコンポーネントのみ遅延ロード |

---

## 詳細

各マイルストーンの詳細は `milestones/` ディレクトリを参照。

- [M1詳細](milestones/M1-foundation.md)
- [M2詳細](milestones/M2-deck-card-management.md)
- [M3詳細](milestones/M3-review-engine.md)
- [M4詳細](milestones/M4-dashboard.md)
- [M5詳細](milestones/M5-ai-generation.md)
