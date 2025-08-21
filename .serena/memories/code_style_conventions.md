# コードスタイル・規約

## TypeScript設定
- **strict mode**: 厳格モード有効
- **target**: ES2020
- **module**: ES2020 (ESM)
- **型安全性**: すべての変数・関数に明示的な型定義

## 命名規約
### クラス・インターフェース
- **PascalCase**: `GameEngine`, `AIProvider`, `CharacterPersonality`
- **インターフェース**: プレフィックスなし（`AIProvider`）

### 変数・関数
- **camelCase**: `emotionState`, `generatePrompt`, `cleanResponse`
- **定数**: `UPPER_SNAKE_CASE`

### ファイル命名
- **kebab-case**: `ai-provider.ts`, `game-engine.ts`
- **システム系**: `-system.ts` サフィックス
- **プロバイダー系**: `-provider.ts` サフィックス

## コード構成パターン
### クラス構造
```typescript
export class ExampleClass {
  // 1. プライベートプロパティ
  private readonly config: Config;
  
  // 2. コンストラクター
  constructor(config: Config) {
    this.config = config;
  }
  
  // 3. パブリックメソッド
  public async publicMethod(): Promise<Result> {
    // 実装
  }
  
  // 4. プライベートメソッド
  private privateMethod(): void {
    // 実装
  }
}
```

## 型定義パターン
- **インターフェース**: 公開API、設定オブジェクト
- **型エイリアス**: ユニオン型、リテラル型
- **Generic**: 再利用可能なコンポーネント

## エラーハンドリング
- **async/await**: Promise ベースの非同期処理
- **try-catch**: 明示的なエラーキャッチ
- **カスタムエラー**: 意味のあるエラーメッセージ

## インポート順序
1. Node.js標準モジュール
2. 外部パッケージ
3. 内部モジュール（型定義）
4. 内部モジュール（実装）

## コメント規約
- **JSDoc**: パブリックAPI用
- **インライン**: 複雑なロジック説明
- **TODO/FIXME**: 将来の改善点