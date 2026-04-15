# 開発ガイドライン (Development Guidelines)

## コーディング規約

### 命名規則

#### 変数・関数

```typescript
// ✅ 良い例
const todayReviewCards = await fetchTodayReviewCards(userId);
function calculateNextReviewDate(card: Card, rating: Rating): Date { }
const isSessionCompleted = remainingCards.length === 0;

// ❌ 悪い例
const data = await fetch(id);
function calc(c: any, r: any): Date { }
```

**原則**:
- 変数: camelCase、名詞または名詞句
- 関数: camelCase、動詞で始める
- 定数: UPPER_SNAKE_CASE
- Boolean: `is`, `has`, `should`, `can` で始める

#### クラス・インターフェース・型

```typescript
// クラス・インターフェース: PascalCase
class SM2Service { }
interface DeckWithStats { }

// 型エイリアス (Union型等): PascalCase
type CardType = 'qa' | 'cloze' | 'code' | 'freewrite';
type Rating = 1 | 2 | 3 | 4;
```

#### Reactコンポーネント

```typescript
// コンポーネント: PascalCase + export default
export default function CardFlip({ card, onRate }: CardFlipProps) { }

// Props型: コンポーネント名 + Props
interface CardFlipProps {
  card: Card;
  onRate: (rating: Rating) => void;
}
```

### コードフォーマット

- **インデント**: 2スペース
- **行の長さ**: 最大100文字
- **セミコロン**: あり
- **クォート**: シングルクォート (`'`)
- **Prettier**: `.prettierrc` に従い自動フォーマット

### コメント規約

**インラインコメント**:

```typescript
// ✅ 良い例: なぜそうするかを説明
// SM-2では最小ease factorを1.3に制限し、無限に間隔が縮まらないようにする
const newEaseFactor = Math.max(1.3, easeFactor - 0.20);

// ❌ 悪い例: コードを読めばわかることを書く
// ease factorを計算する
const newEaseFactor = Math.max(1.3, easeFactor - 0.20);
```

**TSDocコメント**: 複雑なアルゴリズムやサービスのpublicメソッドに記載する。

```typescript
/**
 * SM-2アルゴリズムで次回復習スケジュールを計算する。
 *
 * @param card - 現在のカード状態 (easeFactor, interval, repetitions)
 * @param rating - ユーザーの自己評価 (1=全然わからない〜4=完璧)
 * @returns 更新後のSM-2パラメータと次回復習日
 */
calculate(card: Card, rating: Rating): SM2Result { }
```

### エラーハンドリング

**APIルートのパターン**:

```typescript
// src/app/api/decks/route.ts
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createDeckSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const deck = await deckService.createDeck(session.user.id, parsed.data);
  return Response.json(deck, { status: 201 });
}
```

**サービスレイヤーのパターン**:
- バリデーションはZodスキーマに委ねる (サービスでは再チェックしない)
- DB操作エラーはそのまま上位に伝播させ、APIルートで500を返す
- リソースが見つからない場合は `null` を返す (例外はスローしない。APIルートで404に変換)

### 型の安全性

```typescript
// ✅ 良い例: Zodでバリデーション + 型推論
import { z } from 'zod';
const createCardSchema = z.object({
  deckId: z.string().uuid(),
  cardType: z.enum(['qa', 'cloze', 'code', 'freewrite']),
  front: z.string().min(1).max(2000),
  back: z.string().max(2000),
  tags: z.array(z.string()).max(10),
});
type CreateCardInput = z.infer<typeof createCardSchema>; // 型を自動生成

// ❌ 悪い例: any型の使用
function createCard(data: any) { }
```

---

## Git運用ルール

### ブランチ戦略 (Git Flow)

```
main (本番環境)
└── develop (開発・統合)
    ├── feature/[機能名]   # 新機能開発
    ├── fix/[修正内容]     # バグ修正
    └── refactor/[対象]   # リファクタリング
```

**運用ルール**:
- `main`: 本番リリース済みの安定版のみ。直接コミット禁止
- `develop`: 次期リリース向けの統合ブランチ。直接コミット禁止
- `feature/*`, `fix/*`: `develop` から分岐し、PR経由で `develop` へマージ
- `develop → main`: リリース時に merge commit でマージ
- `feature → develop`: squash merge を推奨 (コミット履歴を整理)

**リリースフロー (develop → main)**:

```bash
# 1. develop が最新であることを確認
git checkout develop && git pull origin develop

# 2. main にマージ (merge commit)
git checkout main
git merge --no-ff develop -m "chore(release): v1.0.0"

# 3. バージョンタグを打つ (セマンティックバージョニング)
git tag v1.0.0

# 4. main とタグをリモートへ push
git push origin main --tags
```

タグはセマンティックバージョニング (`vMAJOR.MINOR.PATCH`) に従う。  
リリースに含まれた変更は `CHANGELOG.md`（リポジトリルート）へ追記する ([Keep a Changelog](https://keepachangelog.com/) 形式)。

**ロールバック手順**:

障害発生時は以下の手順で迅速に前バージョンへ戻す。

```bash
# 1. Vercel ダッシュボードからの即時ロールバック (推奨)
# Vercel ダッシュボード > Deployments > 正常稼働していた Deployment > Promote to Production

# 2. git を使ったロールバック (コードレベルで戻す場合)
# 前のリリースタグを確認
git log --tags --oneline

# リリースタグにリセット (例: v0.9.0 に戻す)
git checkout main
git revert v1.0.0..HEAD   # 差分を revert コミットとして積む (force push 不要)
git push origin main
```

**Prisma マイグレーションのロールバック**:

```bash
# 直前のマイグレーションを DOWN する (schema.prisma を前バージョンに戻した上で実行)
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script > rollback.sql

# 確認後、Supabase SQL Editor または psql で rollback.sql を実行
```

> **注意**: Prisma は自動ロールバックをサポートしない。本番 DB に対する手動 SQL 実行が必要なため、事前に rollback.sql をレビューすること。

**ブランチ命名**:
```
feature/add-review-session
feature/ai-card-generation
fix/sm2-interval-calculation
refactor/card-service
```

### コミットメッセージ規約 (Conventional Commits)

```
<type>(<scope>): <subject>

<body>         # オプション: 変更理由・詳細
<footer>       # オプション: Closes #123
```

**Type一覧**:

| type | 用途 |
|------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみ |
| `style` | フォーマット (動作変更なし) |
| `refactor` | リファクタリング |
| `perf` | パフォーマンス改善 |
| `test` | テスト追加・修正 |
| `chore` | ビルド設定・依存関係更新等 |

**例**:

```
feat(review): SM-2アルゴリズムによる復習スケジューリングを実装

- Rating 1〜4の自己評価に基づきease factor・intervalを更新
- 最小ease factorを1.3に制限
- 次回復習日をCard.nextReviewDateに保存

Closes #42
```

### プルリクエスト

**作成前チェックリスト**:
- [ ] `npm run lint` がパス
- [ ] `npm run typecheck` がパス
- [ ] `npm test` がパス
- [ ] セルフレビュー済み
- [ ] `develop` ブランチと競合が解決済み

**PRテンプレート**:

```markdown
## 変更の種類
- [ ] 新機能 (feat)
- [ ] バグ修正 (fix)
- [ ] リファクタリング (refactor)
- [ ] その他 (docs / chore)

## 変更内容
### 何を変更したか
[簡潔な説明]

### なぜ変更したか
[背景・理由]

### 主な変更点
- [変更点1]
- [変更点2]

## テスト
- [ ] ユニットテスト追加・更新
- [ ] 手動テスト実施
- [ ] モバイルビューポート確認 (UI変更の場合)

## スクリーンショット (UI変更の場合)

## 関連Issue
Closes #[番号]

## レビューポイント
[特に確認してほしい点]
```

---

## テスト戦略

### テストピラミッド

```
       /\
      /E2E\       少 (遅い・高コスト)
     /------\
    / 統合   \     中
   /----------\
  / ユニット   \   多 (速い・低コスト)
 /--------------\
```

**目標比率**: ユニット 70% / 統合 20% / E2E 10%

### カバレッジ目標

| 対象 | ブランチ | 関数 | 行 |
|------|---------|------|-----|
| `lib/services/sm2.ts` | 100% | 100% | 100% |
| `lib/services/` 全体 | 90% | 90% | 90% |
| 全体 | 80% | 80% | 80% |

### テストの書き方 (Given-When-Then)

```typescript
// tests/unit/lib/services/sm2.test.ts
describe('SM2Service', () => {
  describe('calculate', () => {
    it('rating 1のとき repetitionsを0にリセットし interval を1日に戻す', () => {
      // Given
      const service = new SM2Service();
      const card = { easeFactor: 2.5, interval: 10, repetitions: 3 } as Card;

      // When
      const result = service.calculate(card, 1);

      // Then
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBe(2.3); // 2.5 - 0.20
    });

    it('rating 4のとき easeFactor が上限2.5を超えない', () => {
      // Given
      const service = new SM2Service();
      const card = { easeFactor: 2.5, interval: 10, repetitions: 5 } as Card;

      // When
      const result = service.calculate(card, 4);

      // Then
      expect(result.easeFactor).toBe(2.5); // min(2.5, 2.5 + 0.10)
    });
  });
});
```

### テスト命名規則

```typescript
// パターン: [条件]のとき [期待結果]
it('rating 1のとき repetitionsを0にリセットする', () => { });
it('未認証リクエストのとき 401を返す', () => { });
it('deckIdが存在しないとき nullを返す', () => { });
```

### モック方針

- **ユニットテスト**: Prismaクライアント・外部APIはVitest `vi.mock()` でモック化
- **統合テスト**: テスト用Supabaseプロジェクト (または `docker compose` のPostgreSQL) に実際に接続
- **E2E**: ブラウザの実環境で動作確認 (モックなし)

---

## コードレビュー基準

### レビューポイント

**機能性**:
- [ ] PRDの受け入れ条件を満たしているか
- [ ] エッジケース (空配列・null・最大値) が考慮されているか
- [ ] SM-2の計算が仕様と一致しているか (アルゴリズム変更時)

**セキュリティ**:
- [ ] 全APIルートで `auth()` によるセッション検証をしているか
- [ ] 他ユーザーのリソースに `userId` フィルターを掛けているか
- [ ] `GEMINI_API_KEY` がクライアントサイドコードに含まれていないか

**パフォーマンス**:
- [ ] N+1クエリが発生していないか (Prismaの `include` を適切に使用)
- [ ] 復習カード取得に `(userId, nextReviewDate)` インデックスが効いているか

**可読性**:
- [ ] コンポーネント・関数の責務が単一か
- [ ] 複雑なロジック (SM-2計算等) にコメントがあるか

### レビューコメントの書き方

```markdown
[必須] セキュリティ: userId フィルターがないため他のユーザーのカードを取得できます
[推奨] パフォーマンス: cards を include せずに別クエリで取得するとN+1になります。Prismaの include を使いましょう
[提案] 可読性: `r === 1 || r === 2` を `isFailedRating(r)` として抽出するとSM-2のロジックが読みやすくなります
[質問] この `Math.round` はどのタイミングで必要になりますか？
```

---

## 開発環境セットアップ

### 必要なツール

| ツール | バージョン | インストール方法 |
|--------|-----------|-----------------|
| Node.js | 22.x (LTS) | [nvm](https://github.com/nvm-sh/nvm) 推奨 |
| npm | 10.x | Node.js に同梱 |
| Git | 2.x 以上 | OS標準またはHomebrew |

### セットアップ手順

```bash
# 1. リポジトリのクローン
git clone <repository-url>
cd loop-learn

# 2. 依存関係のインストール
npm install

# 3. 環境変数の設定
cp .env.example .env.local
# .env.local に以下を設定:
#   DATABASE_URL, DIRECT_URL (Supabase)
#   NEXTAUTH_SECRET, NEXTAUTH_URL
#   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
#   GEMINI_API_KEY

# 4. DBマイグレーション
npx prisma migrate dev

# 5. 開発サーバーの起動
npm run dev
```

### 開発コマンド

```bash
npm run dev          # 開発サーバー起動 (localhost:3000)
npm run build        # プロダクションビルド
npm test             # Vitestでユニット・統合テスト実行
npm run test:e2e     # Playwrightでe2eテスト実行
npm run lint         # ESLintチェック
npm run typecheck    # TypeScript型チェック
npx prisma studio    # Prisma GUI でDBを確認
```

### 推奨VSCode拡張

- **ESLint**: リアルタイムLintチェック
- **Prettier**: 保存時の自動フォーマット
- **Prisma**: schema.prismaのシンタックスハイライト
- **Tailwind CSS IntelliSense**: クラス名の補完

---

## CI/CD

### GitHub Actions (`.github/workflows/ci.yml`)

```yaml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:coverage
      - run: npm run build
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          DIRECT_URL: ${{ secrets.TEST_DIRECT_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: http://localhost:3000
          GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
          GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}
          # GEMINI_API_KEYは本番APIを呼ばないようE2EテストではAIエンドポイントをモック
```

**GitHub Secrets の設定**:
- `TEST_DATABASE_URL` / `TEST_DIRECT_URL`: E2E テスト専用の Supabase プロジェクト接続文字列（本番とは分離）
- `NEXTAUTH_SECRET`: ランダム文字列（`openssl rand -base64 32` で生成）
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: テスト用 Google OAuth クライアント

**E2E テストの AI 生成エンドポイント**: Gemini API を実際に呼ぶとコスト・レート制限・flakyness のリスクがあるため、`tests/e2e/` 内の AI 生成テストは `page.route()` で `POST /api/ai/generate` をインターセプトし、モックレスポンスを返す。

**追加スクリプト** (`package.json` に設定):

```json
{
  "scripts": {
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

カバレッジは `vitest.config.ts` で閾値を設定する:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        // グローバル: 全体の最低ライン
        global: { branches: 80, functions: 80, lines: 80, statements: 80 },
        // サービスレイヤー全体: 高品質を維持
        // ※ glob パターンキーは Vitest v2 時点で experimental。動作しない場合は perFile オプションで代替
        'src/lib/services/**': { branches: 90, functions: 90, lines: 90, statements: 90 },
        // SM-2アルゴリズム: 計算ロジックは完全カバレッジ必須
        'src/lib/services/sm2.ts': { branches: 100, functions: 100, lines: 100, statements: 100 },
      },
      include: ['src/**'],
    },
  },
});
```

### Pre-commit フック (Husky + lint-staged)

コミット前に変更ファイルへのLint・フォーマット・型チェックを自動実行する。

**初期化手順**:

```bash
# 1. インストール
npm install --save-dev husky lint-staged

# 2. Huskyを初期化 (`.husky/` ディレクトリを生成)
npx husky init

# 3. pre-commitフックにlint-staged + 型チェックを設定
echo 'npx lint-staged && npm run typecheck' > .husky/pre-commit
```

**設定** (`package.json` 抜粋):

```json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```
