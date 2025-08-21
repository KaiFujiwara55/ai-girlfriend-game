# 🤖 LINE Bot セットアップガイド

AI彼女ゲームをLINE Botとして動作させるための完全ガイドです。

## 📋 前提条件

- Node.js 18+ がインストール済み
- LINE Developers アカウント
- 選択したクラウドサービスのアカウント

## 🔧 1. LINE Developers 設定

### 1.1 LINE Developers Console にログイン
https://developers.line.biz/

### 1.2 プロバイダーを作成
1. 「プロバイダーを作成」をクリック
2. プロバイダー名を入力（例：AI GirlfriendGame）

### 1.3 チャンネルを作成
1. 「Messaging API」を選択
2. チャンネル情報を入力：
   - チャンネル名：AI彼女ゲーム
   - チャンネル説明：AIキャラクターとの会話ゲーム
   - 大業種・小業種：適切なものを選択
   - メールアドレス：あなたのメールアドレス

### 1.4 必要な設定値を取得
#### チャンネルアクセストークン
1. 「Messaging API設定」タブ
2. 「チャンネルアクセストークン」を発行
3. トークンをコピー

#### チャンネルシークレット
1. 「チャネル基本設定」タブ  
2. 「チャンネルシークレット」をコピー

## ⚙️ 2. ローカル環境設定

### 2.1 環境変数ファイルを作成
```bash
cp .env.example .env
```

### 2.2 .envファイルを編集
```bash
# AI Provider（既存の設定）
GEMINI_API_KEY=your-gemini-api-key-here

# LINE Bot設定（追加）
LINE_CHANNEL_ACCESS_TOKEN=取得したアクセストークン
LINE_CHANNEL_SECRET=取得したシークレット

# サーバー設定
PORT=3000
```

### 2.3 ローカルでテスト起動
```bash
npm run dev:linebot
```

サーバーが `http://localhost:3000` で起動します。

## 🌐 3. デプロイオプション

### オプション A: Railway（推奨）

#### 3.1 Railway準備
1. [Railway](https://railway.app/) にサインアップ
2. GitHubリポジトリを接続

#### 3.2 環境変数設定
Railway ダッシュボードで以下を設定：
- `GEMINI_API_KEY`
- `LINE_CHANNEL_ACCESS_TOKEN` 
- `LINE_CHANNEL_SECRET`
- `NODE_ENV=production`

#### 3.3 デプロイ
- `railway.toml` が自動で設定を読み込み
- 自動デプロイが開始されます

### オプション B: Vercel

#### 3.1 Vercel準備
```bash
npm i -g vercel
vercel login
```

#### 3.2 デプロイ
```bash
npm run build
vercel --prod
```

#### 3.3 環境変数設定
Vercel ダッシュボードで環境変数を設定

### オプション C: Docker

#### 3.1 イメージをビルド
```bash
docker build -t ai-girlfriend-linebot .
```

#### 3.2 コンテナを起動
```bash
docker run -p 3000:3000 --env-file .env ai-girlfriend-linebot
```

## 🔗 4. Webhook設定

### 4.1 WebhookURLを設定
1. LINE Developers Console の「Messaging API設定」
2. WebhookURL: `https://your-domain.com/webhook`
   - Railway: `https://your-app.railway.app/webhook`
   - Vercel: `https://your-app.vercel.app/webhook`
3. 「Webhookの利用」をONに設定

### 4.2 応答設定
1. 「応答設定」で以下を設定：
   - 「応答メッセージ」：OFF
   - 「あいさつメッセージ」：OFF  
   - 「Webhook」：ON

### 4.3 動作確認
1. LINE公式アカウントを友だち追加
2. メッセージを送信してレスポンスを確認

## 🧪 5. テスト方法

### 5.1 基本動作テスト
- 何かメッセージを送信 → キャラクター選択画面が表示
- キャラクターを選択 → ゲーム開始
- 「ヘルプ」→ ヘルプメッセージ表示
- 「ステータス」→ 現在状態表示

### 5.2 ゲームフローテスト
1. キャラクター選択（さくら/あや/みさき）
2. 自然な会話でコミュニケーション
3. 感情値の変化を確認
4. 告白して成功/失敗を確認

## 📊 6. 料金について

### LINE API料金
- 無料枠：月200通まで
- 返信メッセージ：課金対象外（重要！）
- 推奨：コミュニケーションプランで十分

### サーバー費用
- Railway: $5/月〜
- Vercel: 無料〜$20/月
- Docker: VPS費用による

## 🐛 7. トラブルシューティング

### よくある問題

#### Webhookが動作しない
- HTTPSが必要（http://は不可）
- URLが正確か確認
- 環境変数が正しく設定されているか確認

#### Bot が応答しない
```bash
# ログを確認
npm run dev:linebot
```

#### Node.jsバージョンエラー  
LINE Bot SDK は Node.js 20+ が必要です：
```bash
nvm use 20  # nvmを使用している場合
```

### デバッグモード
```bash
DEBUG=true npm run dev:linebot
```

## 📱 8. 運用Tips

### セキュリティ
- 環境変数は絶対にGitにコミットしない
- トークンは定期的に再発行を検討

### パフォーマンス
- セッション管理で自動クリーンアップを実装済み
- 1時間非アクティブでセッション削除

### ユーザーエクスペリエンス
- リッチメニューの活用を検討
- プッシュメッセージでの通知機能

## 🎉 完了！

これでLINE上でAI彼女ゲームが楽しめるようになりました！

### さらなる拡張
- 画像送信機能
- スタンプ対応
- LINE Mini App化
- プッシュ通知機能

問題があれば、ログを確認してデバッグを行ってください。