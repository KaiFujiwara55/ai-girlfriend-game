# 推奨コマンド集

## 開発コマンド
```bash
# 開発サーバー起動（推奨）
npm run dev

# 本番ビルド
npm run build

# 本番実行
npm start

# 型チェック
npm run typecheck
```

## テストコマンド
```bash
# 全テスト実行
npm test

# 手動テスト（インタラクティブ）
npm run test:manual

# シミュレーションテスト（自動会話）
npm run test:simulation

# Gemini APIテスト
npm run test:gemini

# Gemini ライブテスト（実際のAPI呼び出し）
npm run test:live

# 包括的テスト（推奨）
npm run test:all
```

## 環境セットアップ
```bash
# 依存関係インストール
npm install

# 環境変数ファイル作成
cp .env.example .env

# .envファイル編集（APIキー設定）
# 推奨: GEMINI_API_KEY=your-api-key
```

## Git操作
```bash
# ステータス確認
git status

# 変更をステージング
git add .

# コミット
git commit -m "適切なコミットメッセージ"

# プッシュ
git push origin main
```

## システムコマンド（macOS）
```bash
# ファイル一覧
ls -la

# ディレクトリ変更
cd /path/to/directory

# ファイル検索
find . -name "*.ts"

# 文字列検索
grep -r "検索文字列" src/

# プロセス確認
ps aux | grep node
```

## 実行時パラメータ
- ゲーム開始: `npm run dev`を実行後、指示に従ってキャラクター選択
- 特殊コマンド: `status`, `help`, `告白`, `quit`