# コードベース構造

## ディレクトリ構成
```
src/
├── types/           # 型定義
│   ├── ai-provider.ts  # AIプロバイダーインターフェース
│   └── game.ts        # ゲーム関連型定義
├── providers/       # AIプロバイダー実装
│   ├── ai-provider-factory.ts  # ファクトリーパターン
│   ├── claude-provider.ts      # Claude API実装
│   ├── openai-provider.ts      # OpenAI API実装
│   └── gemini-provider.ts      # Gemini API実装
├── characters/      # キャラクター設定
│   └── character-data.ts       # 詳細キャラクター定義
├── systems/         # ゲームシステム
│   ├── emotion-system.ts       # 感情管理システム
│   ├── prompt-system.ts        # プロンプト生成システム
│   ├── conversation-manager.ts # 会話履歴管理
│   └── dialogue-system.ts      # 対話システム
├── test/           # テストファイル
│   ├── test-runner.ts         # 統合テストランナー
│   ├── manual-test.ts         # 手動テスト
│   ├── simulation-test.ts     # シミュレーションテスト
│   ├── gemini-test.ts         # Gemini APIテスト
│   └── gemini-live-test.ts    # Gemini ライブテスト
├── game-engine.ts   # メインゲームエンジン
└── index.ts        # アプリケーションエントリーポイント
```

## 主要クラス・インターフェース
- **AIGirlfriendGame**: メインゲームクラス
- **GameEngine**: ゲームロジック管理
- **AIProvider**: AIプロバイダー抽象インターフェース
- **EmotionState**: 感情状態管理
- **CharacterPersonality**: キャラクター性格定義
- **ConversationManager**: 会話履歴・コンテキスト管理

## アーキテクチャパターン
- **ファクトリーパターン**: AIプロバイダーの動的生成
- **抽象化レイヤー**: AIプロバイダー間の差異を隠蔽
- **システム分離**: 感情、対話、プロンプト生成の独立性
- **型安全性**: TypeScriptによる厳密な型定義