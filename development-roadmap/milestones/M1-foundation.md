# M1: 基盤構築 — プロジェクト初期化 + 認証

> 状態: ✅ 完了
> 対象期間: 2026-04-15
> 依存: なし（起点マイルストーン）

---

## 概要

Next.js 15 フルスタックプロジェクトの初期構成と Google OAuth 認証を実装した。
すべての後続マイルストーンが依存する認証基盤・Prismaスキーマ・開発環境を確立した。

---

## 含む機能・タスク

### プロジェクト初期化

- [x] package.json (Next.js 15 / React 19 / TypeScript / Tailwind CSS 4 / Prisma 6 / next-auth 5.0.0-beta.31)
- [x] tsconfig.json (`@/*` パスエイリアス)
- [x] next.config.ts
- [x] tailwind.config.ts + globals.css
- [x] .gitignore / .env.example
- [x] vitest.config.ts (`resolve.alias` でパスエイリアス解決)
- [x] eslint.config.mjs (next/core-web-vitals)

### Prismaスキーマ定義

- [x] User / Deck / Card (SM-2パラメータ) / ReviewLog モデル
- [x] NextAuth.js 用モデル (Account / Session / VerificationToken)
- [x] インデックス: `Card(userId, nextReviewDate)` / `Card(deckId)` / `ReviewLog(userId, reviewedAt)`

### 型定義・バリデーション・インフラ

- [x] `src/types/card.ts` / `src/types/deck.ts`
- [x] `src/lib/validations/card.schema.ts` (Zod: createCardSchema)
- [x] `src/lib/prisma.ts` (Prismaシングルトン)
- [x] `src/lib/auth.ts` (NextAuth設定)
- [x] `next-auth.d.ts` (Session.user.id 型拡張)

### カード作成基盤

- [x] `src/lib/services/card.ts` (createCard: SM-2初期値 + deckId所有権検証)
- [x] `POST /api/cards` (認証 → バリデーション → createCard)
- [x] CardEditor (4タイプ選択 / front-back テキストエリア / TagInput / リアルタイムプレビュー)
- [x] CardPreview (react-markdown + remark-gfm + rehype-sanitize / cloze変換)
- [x] TagInput (Enter/カンマ追加 / 削除 / 最大10個制限)
- [x] `src/app/(app)/cards/new/page.tsx`

### 認証

- [x] `src/app/api/auth/[...nextauth]/route.ts`
- [x] `src/app/(auth)/layout.tsx` / `src/app/(auth)/login/page.tsx`
- [x] `src/app/(app)/layout.tsx` (auth()ガード + AppNav)
- [x] `src/components/layout/AppNav.tsx` (ユーザー名・アバター・サインアウト)
- [x] `src/app/page.tsx` (ランディングページ: 認証済み→リダイレクト / 未認証→サービス紹介)

### GitHub Actions CI (追加実施: 2026-04-21)

- [x] `.github/workflows/ci.yml` — push/PR時に lint / typecheck / test / build を自動実行
- [x] `permissions: contents: read` (最小権限原則)
- [x] `actions/setup-node@v4` + `cache: 'npm'` (npm cache最適化)

### 品質チェック

- [x] `npm run lint` パス
- [x] `npm run typecheck` パス
- [x] `npm test` パス
- [x] `npm run build` パス

---

## 受け入れ条件

- [x] Googleアカウントでサインイン・サインアウトできる
- [x] 未認証ユーザーが `/cards/new` 等にアクセスすると `/login` にリダイレクトされる
- [x] 4種類のカードタイプ (qa/cloze/code/freewrite) でカードを作成できる
- [x] カード作成時にMarkdownプレビューが表示される
- [x] セキュリティ: 他ユーザーのdeckIdを指定してカード作成ができない (404を返す)
- [x] lint / typecheck / test / build がすべて通る

---

## KPI貢献

| KPI | 貢献内容 | 計測方法 |
|-----|---------|---------|
| セキュリティ基盤 | 認証ガードで不正アクセスを防止 | 認証なしアクセスのリダイレクト動作確認 |

---

## 技術的前提条件・依存

| 種別 | 内容 | 備考 |
|------|------|------|
| 外部サービス | Supabase PostgreSQL | `DATABASE_URL` / `DIRECT_URL` 設定が必要 |
| 外部サービス | Google OAuth | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` |
| 環境変数 | `NEXTAUTH_SECRET` | `openssl rand -base64 32` で生成 |

---

## 実装メモ

- `next-auth@^5.0.0` はnpmレジストリに存在しないため `5.0.0-beta.31` を明示指定
- `vite-tsconfig-paths` はESM onlyのため `resolve.alias` を直接記述
- `vitest` の jsdom 環境には `jsdom` パッケージの別途インストールが必要
- NextAuth v5 の `signIn()` / `signOut()` はサーバーサイド専用 (Server Actions で使用)

---

## 進捗

- **着手日**: 2026-04-15
- **完了日**: 2026-04-15
- **ステアリング**: `.steering/20260415-学習カード作成/`, `.steering/20260415-認証/`
