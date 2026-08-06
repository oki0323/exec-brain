# 🗂️ AI秘書

経営者・ビジネスパーソンの日々の業務を支えるAI秘書Webアプリ。
OpenAI（GPT）を使ってチャット相談・タスク整理・スケジュール記録・議事録要約を行います。

## 機能

- **💬 チャット相談窓口** — タスクや予定を踏まえた上で、AI秘書に自由に相談できる
- **✅ タスク・ToDo管理** — タスクを登録し、AIに優先順位付け・最初の一歩のアドバイスをしてもらう
- **📅 スケジュール／メモ秘書** — 自然文で予定・メモを入力すると、AIが日時を抽出して整理。次のアクションも提案
- **📝 日報・議事録の要約** — 長文のメモや議事録を貼り付けると、要約・決定事項・アクションアイテム・次回確認事項に整理。アクションアイテムはワンクリックでタスクに追加可能

## 技術スタック

- React + Vite
- React Router v7
- OpenAI API（GPT-4o mini）
- localStorage（データ保存、サーバー不要）

---

## セットアップ

```bash
cd ai-secretary
npm install
```

### APIキーの設定

1. [OpenAI Platform](https://platform.openai.com/api-keys) でAPIキーを取得
2. `npm run dev` 後、アプリの「設定」画面からAPIキーを入力（`localStorage`にのみ保存されます）

または `.env.local` に以下を設定することも可能です:

```
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 開発サーバー起動

```bash
npm run dev
```

`http://localhost:5173` で動作確認できます。

### ビルド

```bash
npm run build
```

## ライセンス

MIT
