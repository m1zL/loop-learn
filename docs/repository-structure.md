# リポジトリ構造定義書 (Repository Structure Document)

## プロジェクト構造

```
loop-learn/
├── src/
│   ├── app/                          # Next.js App Router (ページ・APIルート)
│   ├── components/                   # Reactコンポーネント
│   ├── lib/                          # サービスレイヤー・ユーティリティ
│   └── types/                        # 共有型定義
├── prisma/                           # DBスキーマ・マイグレーション
├── public/                           # 静的ファイル (PWAマニフェスト等)
├── tests/
│   ├── unit/                         # Vitestユニットテスト
│   ├── integration/                  # Vitest統合テスト
│   └── e2e/                          # Playwright E2Eテスト
├── docs/                             # プロジェクトドキュメント
├── .github/                          # GitHub Actions CI/CD設定
├── .claude/                          # Claude Code設定・スキル
├── .steering/                        # 機能開発ごとのタスク管理
└── scripts/                          # 開発補助スクリプト
```

---

## ディレクトリ詳細

### src/app/ (Next.js App Router)

**役割**: ページコンポーネント・APIルートの定義。ルーティング・レイアウト・認証ガードを担う。

**配置ファイル**:
- `page.tsx`: 各ページのサーバーコンポーネント
- `layout.tsx`: 共通レイアウト
- `route.ts`: APIルートハンドラー
- `loading.tsx` / `error.tsx`: ローディング・エラーUI

**命名規則**:
- ルートグループ: `(auth)/`, `(app)/` のように括弧でグルーピング (URLには影響しない)
- 動的ルート: `[deckId]/`, `[cardId]/`
- APIルート: `route.ts` 固定名

**依存関係**:
- 依存可能: `components/`, `lib/services/`, `lib/validations/`, `types/`
- 依存禁止: 他のページ・APIルートへの直接import

**構造**:
```
app/
├── page.tsx                          # ランディングページ (未ログイン時: サービス紹介)
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (app)/
│   ├── layout.tsx                    # 認証チェック・共通ナビ
│   ├── dashboard/
│   │   └── page.tsx
│   ├── decks/
│   │   ├── page.tsx                  # デッキ一覧
│   │   ├── new/page.tsx              # デッキ作成
│   │   └── [deckId]/
│   │       ├── page.tsx              # デッキ詳細
│   │       └── edit/page.tsx
│   ├── cards/
│   │   ├── new/page.tsx
│   │   ├── [cardId]/edit/page.tsx
│   │   └── generate/page.tsx         # AI生成
│   ├── review/
│   │   ├── page.tsx                  # 復習セッション
│   │   └── summary/page.tsx
│   └── stats/
│       └── page.tsx
└── api/
    ├── auth/[...nextauth]/route.ts
    ├── decks/
    │   ├── route.ts                  # GET (一覧), POST (作成)
    │   └── [deckId]/route.ts         # GET, PUT, DELETE
    ├── cards/
    │   ├── route.ts                  # GET (一覧), POST (作成)
    │   ├── batch/route.ts            # POST (AI生成カードの一括保存)
    │   └── [cardId]/route.ts         # GET, PUT, DELETE
    ├── review/
    │   ├── today/route.ts            # GET (本日の復習カード)
    │   └── [cardId]/route.ts         # POST (評価送信)
    ├── ai/
    │   └── generate/route.ts         # POST (AI生成)
    └── stats/
        └── route.ts                  # GET (統計)
```

---

### src/components/ (Reactコンポーネント)

**役割**: 再利用可能なUIコンポーネント。ページをまたいで使われる表示パーツを配置。

**配置ファイル**:
- `ui/`: ボタン・入力・モーダルなどの汎用パーツ
- `cards/`: カード作成・表示・フリップに関するコンポーネント
- `decks/`: デッキ一覧・デッキカードコンポーネント
- `review/`: 復習セッション・進捗バーコンポーネント
- `layout/`: ナビゲーション・ヘッダー・サイドバー

**命名規則**:
- コンポーネントファイル: PascalCase (`CardFlip.tsx`, `DeckCard.tsx`)
- 1ファイル1コンポーネントを原則とし、密接に関連する小コンポーネントのみ同ファイルに含める

**依存関係**:
- 依存可能: `ui/` (汎用パーツ), `types/`, `lib/` (ユーティリティのみ)
- 依存禁止: `lib/services/` への直接呼び出し (必ずAPIルート経由)

**構造**:
```
components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   └── ProgressBar.tsx
├── cards/
│   ├── CardFlip.tsx                  # カードフリップUI
│   ├── CardEditor.tsx                # Markdown/Mermaid入力エディタ
│   ├── CardPreview.tsx               # Markdown/Mermaidプレビュー
│   └── ClozeEditor.tsx               # 穴埋め記法エディタ
├── decks/
│   ├── DeckCard.tsx                  # デッキ一覧の1枚
│   ├── DeckIcon.tsx                  # 絵文字/アイコン選択
│   └── DeckStats.tsx                 # 今日の復習予定数等
├── review/
│   ├── RatingButtons.tsx             # 自己評価ボタン (1〜4)
│   ├── SessionProgress.tsx           # 残り枚数表示
│   └── SessionSummary.tsx            # セッション終了サマリー
├── stats/
│   ├── HeatmapCalendar.tsx           # 学習ヒートマップ
│   └── MasteryDistribution.tsx       # 習熟度グラフ
└── layout/
    ├── AppNav.tsx
    └── StreakBadge.tsx
```

---

### src/lib/ (サービスレイヤー・ユーティリティ)

**役割**: ビジネスロジック・バリデーション・外部API連携。APIルートから呼び出される。

**配置ファイル**:
- `services/`: ビジネスロジック実装
- `validations/`: Zodスキーマ定義
- `auth.ts`: NextAuth.js設定
- `prisma.ts`: Prismaクライアントのシングルトン

**命名規則**:
- サービスファイル: camelCase (`sm2.ts`, `aiGenerator.ts`, `deck.ts`)
- Zodスキーマファイル: camelCase + `.schema.ts` (`card.schema.ts`, `deck.schema.ts`)

**依存関係**:
- 依存可能: `types/`, Prismaクライアント, 外部SDK (`@google/generative-ai`)
- 依存禁止: `app/` (ページ・APIルート), `components/`

**構造**:
```
lib/
├── services/
│   ├── sm2.ts                        # SM-2アルゴリズム計算
│   ├── review.ts                     # 復習セッションロジック
│   ├── deck.ts                       # デッキCRUD
│   ├── card.ts                       # カードCRUD
│   ├── aiGenerator.ts                # Gemini API連携・カード生成
│   └── stats.ts                      # 統計・ヒートマップ集計
├── validations/
│   ├── deck.schema.ts                # デッキ作成・更新のZodスキーマ
│   ├── card.schema.ts                # カード作成・更新のZodスキーマ
│   └── review.schema.ts              # 自己評価のZodスキーマ
├── auth.ts                           # NextAuth.js設定 (Google OAuth等)
└── prisma.ts                         # Prismaクライアントシングルトン
```

---

### src/types/ (共有型定義)

**役割**: 複数のレイヤーにまたがる型定義を一元管理。

**配置ファイル**:
- ドメインエンティティの型定義
- APIレスポンス型
- 共通Enum・Union型

**命名規則**:
- ファイル名: kebab-case (`card-types.ts`, `review-types.ts`)
- 型・インターフェース名: PascalCase

**依存関係**:
- 依存可能: なし (他のディレクトリに依存しない)
- 依存禁止: すべて (最下層として循環依存を防ぐ)

**構造**:
```
types/
├── user.ts                           # User, UserSession
├── deck.ts                           # Deck, DeckWithStats
├── card.ts                           # Card, CardType, GeneratedCard
├── review.ts                         # Rating, ReviewLog, SM2Result, SessionSummary
└── stats.ts                          # UserStats, HeatmapEntry
```

---

### prisma/ (DBスキーマ・マイグレーション)

**役割**: データベーススキーマの定義とマイグレーション履歴の管理。

**構造**:
```
prisma/
├── schema.prisma                     # テーブル定義・リレーション
└── migrations/
    └── YYYYMMDDHHMMSS_description/   # 各マイグレーション
        └── migration.sql
```

---

### tests/ (テストコード)

**役割**: 品質保証のためのテストを種別ごとに整理。

**構造**:
```
tests/
├── unit/
│   └── lib/
│       └── services/
│           ├── sm2.test.ts           # SM-2アルゴリズムのテスト
│           └── stats.test.ts
├── integration/
│   └── api/
│       ├── decks.test.ts             # デッキAPIの統合テスト
│       ├── cards.test.ts
│       └── review.test.ts
└── e2e/
    ├── review-session.spec.ts        # 復習セッション完走シナリオ
    ├── ai-generate.spec.ts           # AI生成→保存フロー
    └── mobile-viewport.spec.ts       # 375pxでのモバイルUIテスト
```

---

## ファイル配置規則

### ソースファイル

| ファイル種別 | 配置先 | 命名規則 | 例 |
|------------|--------|---------|-----|
| ページコンポーネント | `src/app/(app)/[route]/page.tsx` | `page.tsx` 固定 | `dashboard/page.tsx` |
| APIルート | `src/app/api/[resource]/route.ts` | `route.ts` 固定 | `api/decks/route.ts` |
| UIコンポーネント | `src/components/[domain]/` | PascalCase.tsx | `CardFlip.tsx` |
| サービス | `src/lib/services/` | camelCase.ts | `sm2.ts` |
| Zodスキーマ | `src/lib/validations/` | camelCase.schema.ts | `card.schema.ts` |
| 型定義 | `src/types/` | kebab-case.ts | `card-types.ts` |

### テストファイル

| テスト種別 | 配置先 | 命名規則 | 例 |
|-----------|--------|---------|-----|
| ユニットテスト | `tests/unit/` | [対象].test.ts | `sm2.test.ts` |
| 統合テスト | `tests/integration/api/` | [リソース].test.ts | `decks.test.ts` |
| E2Eテスト | `tests/e2e/` | [シナリオ].spec.ts | `review-session.spec.ts` |

### 設定ファイル (プロジェクトルート)

| ファイル | 用途 |
|---------|------|
| `next.config.ts` | Next.js設定 (画像ホスト許可・Mermaidのサーバーサイドバンドル除外) |
| `prisma/schema.prisma` | DBスキーマ |
| `postcss.config.mjs` | PostCSS設定 (Tailwind CSS v4 の `@tailwindcss/postcss` プラグインを登録) |
| `tsconfig.json` | TypeScript設定 |
| `vitest.config.ts` | Vitest設定 |
| `playwright.config.ts` | Playwright設定 |
| `.env.local` | ローカル環境変数 (gitignore) |
| `.env.example` | 環境変数テンプレート (gitignoreしない) |

---

## 命名規則

### ディレクトリ名
- Next.jsのルートセグメント: kebab-case (`review/`, `ai/`)
- ルートグループ: 括弧付き (`(auth)/`, `(app)/`)
- コンポーネントグループ: kebab-case (`cards/`, `decks/`)

### ファイル名
- Next.js規約ファイル: 小文字固定 (`page.tsx`, `layout.tsx`, `route.ts`)
- Reactコンポーネント: PascalCase (`CardFlip.tsx`, `DeckCard.tsx`)
- サービス・ユーティリティ: camelCase (`sm2.ts`, `aiGenerator.ts`)
- 型定義: kebab-case (`card-types.ts`)
- Zodスキーマ: `[domain].schema.ts`

### コード内命名
- コンポーネント名: PascalCase
- 関数・変数: camelCase
- 定数: UPPER_SNAKE_CASE
- 型・インターフェース: PascalCase (`type CardType`, `interface Deck`)

---

## 依存関係のルール

```
app/pages (RSC/Client)
    ↓ fetch
app/api (Route Handlers)
    ↓ import
lib/services
    ↓ import
lib/prisma.ts → PostgreSQL
    +
外部SDK (`@google/generative-ai`)

components ←── app/pages が import
components ──→ types のみ依存
```

**禁止される依存**:
- `components/` → `lib/services/` への直接呼び出し (必ずAPIルート経由)
- `lib/services/` → `app/` への逆依存
- `types/` → 他ディレクトリへの依存

---

## 特殊ディレクトリ

### .steering/ (機能開発タスク管理)

**役割**: `/add-feature` スキルが生成する、機能単位のタスク管理ファイルを格納。

**構造**:
```
.steering/
└── YYYYMMDD-[feature-name]/
    ├── requirements.md               # 機能要件
    ├── design.md                     # 設計判断
    └── tasklist.md                   # タスクリスト (進捗の唯一の情報源)
```

**命名規則**: `20260415-add-review-session` 形式

### .claude/ (Claude Code設定)

**役割**: Claude Codeのスキル・設定を格納。プロジェクト固有のワークフローを定義。

```
.claude/
├── settings.json
└── skills/                           # /コマンドで呼び出せるスキル
```

---

### public/ (静的ファイル)

**役割**: Next.js が `/` パスでそのまま配信する静的ファイル。PWA対応に必要なファイルを配置。

**構造**:
```
public/
├── manifest.json                     # PWAマニフェスト (アプリ名・アイコン・テーマカラー)
└── icons/
    ├── icon-192x192.png              # Android ホーム画面アイコン
    └── icon-512x512.png              # スプラッシュスクリーン・PWAインストール用アイコン
```

**注意**: Service Worker (`sw.js`) は Next.js のビルドプロセスで生成するため、ソースには含めない。

---

### scripts/ (開発補助スクリプト)

**役割**: 開発・運用を補助する単発実行用スクリプト。アプリケーションコードには含めない処理を配置。

**構造**:
```
scripts/
├── seed.ts                           # 開発用シードデータ投入 (Prismaでサンプルデッキ・カードを生成)
└── check-env.ts                      # 必要な環境変数が設定されているか起動前に検証
```

**実行方法**:
```bash
npx ts-node scripts/seed.ts           # シードデータ投入
npx ts-node scripts/check-env.ts      # 環境変数チェック
```

---

### .github/ (CI/CD設定)

**役割**: GitHub Actions のワークフロー定義。プッシュ・PRをトリガーにLint・テスト・ビルドを自動実行。

**構造**:
```
.github/
└── workflows/
    └── ci.yml                        # メインCIワークフロー (lint / typecheck / test / build / E2E)
```

詳細な `ci.yml` の内容は [開発ガイドライン - CI/CD](./development-guidelines.md#cicd) を参照。

---

## 除外設定 (.gitignore)

```
# 依存関係
node_modules/

# ビルド成果物
.next/
dist/
out/

# 環境変数 (機密情報)
.env
.env.local
.env.*.local

# テスト成果物
coverage/
playwright-report/
test-results/

# OS・エディタ
.DS_Store
*.log

# ステアリング (開発中タスク管理 - リポジトリ管理不要)
.steering/
```

---

## スケーリング戦略

### 機能の追加

| 規模 | 方針 |
|------|------|
| 小規模 (1〜2ファイル) | 既存の適切なディレクトリに追加 |
| 中規模 (3〜9ファイル) | `components/[domain]/` または `lib/services/` にサブファイルを追加 |
| 大規模 (10ファイル以上) | `lib/services/[feature]/` としてサブディレクトリ化を検討 |

### ファイルサイズの管理
- 1ファイル300行以下を推奨
- 300〜500行: リファクタリングを検討
- 500行以上: 責務分割を強く推奨
