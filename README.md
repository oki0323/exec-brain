# 🧠 Exec Brain

経営者思考を毎日5〜10分で鍛えるAIトレーニングWebアプリ。
OpenAI（GPT）によって問題生成・フィードバックを行います。

## 機能

- **デイリーチャレンジ** — 5領域（ロジカル・発想力・数字感覚・意思決定・言語化）からランダム出題
- **水平思考クイズ** — 状況を推理する「はい/いいえ」クイズ
- **AIフィードバック** — 回答をAIが採点。改善点・模範解答を表示
- **成長トラッカー** — レーダーチャートでスキルバランスを可視化
- **ストリーク** — 連続学習日数を記録
- **チュートリアル** — 初回起動時にアプリの使い方を案内

## 技術スタック

- React + Vite
- React Router v7
- Recharts（レーダーチャート）
- OpenAI API（GPT-4o mini）
- localStorage（データ保存）

---

## セットアップ

### 1. リポジトリのクローン or ダウンロード

```bash
git clone <your-repo-url>
cd exec-brain
npm install
```

### 2. APIキーの取得

1. [OpenAI Platform](https://platform.openai.com/api-keys) を開く
2. 「Create new secret key」をクリック
3. 表示されたキー（`sk-...`）をコピーする

### 3. 環境変数の設定（ローカル開発用）

`.env.local` ファイルを編集して、取得したAPIキーを貼り付ける:

```
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> `.env.local` は `.gitignore` に含まれているため、GitHubには公開されません。

### 4. 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開くと動作確認できます。

---

## GitHubへのpush手順

```bash
# 1. GitHubで新しいリポジトリを作成（exec-brain などの名前で）
# 2. ローカルでGit初期化
git init
git add .
git commit -m "Initial commit: Exec Brain app"

# 3. リモートを追加してpush
git remote add origin https://github.com/<あなたのユーザー名>/exec-brain.git
git branch -M main
git push -u origin main
```

---

## Vercelへのデプロイ手順

### 方法A: Vercel CLI（推奨）

```bash
npm install -g vercel
vercel
```

指示に従って設定を進めると自動デプロイされます。

### 方法B: GitHubと連携

1. [vercel.com](https://vercel.com) にサインイン
2. 「New Project」→ GitHubリポジトリを選択
3. **Environment Variables** に以下を追加:
   - `VITE_OPENAI_API_KEY` = `sk-xxxxxxxx...`（APIキー）
4. 「Deploy」をクリック

### 重要: Vercel側のAPIキー設定

Vercelにデプロイ後、アプリの設定画面（⚙️）からもAPIキーを入力できます。
Vercelの環境変数は **ビルド時** に使用されますが、このアプリはAPIキーを
`localStorage` に保存する設計のため、**ユーザーが設定画面で入力する方式**が主です。

---

## ビルド

```bash
npm run build
```

`dist/` フォルダが生成されます。

## ライセンス

MIT

---

## 関連アプリ: AI秘書

`ai-secretary/` に、経営者の日々の業務を支える別アプリ「AI秘書」があります。
チャット相談・タスク整理・スケジュール記録・議事録要約の4機能を持つ、Exec Brainとは独立したReact/Viteアプリです。
詳細は [`ai-secretary/README.md`](./ai-secretary/README.md) を参照してください。
