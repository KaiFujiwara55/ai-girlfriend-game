# 技術スタック

## 言語・ランタイム
- **TypeScript 5.3+**: 静的型付けによる安全性確保
- **Node.js 18.x+**: JavaScriptランタイム
- **ES2020**: モジュールシステム

## 依存関係
### プロダクション依存
- **dotenv ^17.2.1**: 環境変数管理
- **openai ^4.24.0**: OpenAI API クライアント
- **readline-sync ^1.4.10**: 同期的コマンドライン入力

### 開発依存
- **@types/node ^20.10.0**: Node.js型定義
- **@types/readline-sync ^1.4.8**: readline-sync型定義
- **ts-node ^10.9.1**: TypeScript直接実行
- **typescript ^5.3.0**: TypeScriptコンパイラー

## AIプロバイダー
- **Google Gemini**: 無料API（推奨）- 1日1500リクエスト
- **Claude (Anthropic)**: 有料API
- **OpenAI GPT**: 有料API

## ビルドツール
- **TypeScript Compiler**: ES2020ターゲット
- **ts-node**: 開発時の直接実行
- **ESM (ES Modules)**: モジュールシステム

## 環境設定
- **.env**: 環境変数（APIキー等）
- **strict mode**: TypeScript厳格モード有効
- **esModuleInterop**: CommonJS/ESMの相互運用