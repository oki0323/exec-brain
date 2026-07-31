const MODELS = ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-3.5-turbo'];

function parseJSON(text) {
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // fall through to brace extraction below
  }

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);

  throw new Error(`JSONパースに失敗しました: ${cleaned.slice(0, 200)}`);
}

async function chatCompletion(apiKey, messages, { json = false } = {}) {
  let lastError;
  for (const model of MODELS) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          ...(json ? { response_format: { type: 'json_object' } } : {}),
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        const err = new Error(`OpenAI APIエラー ${res.status}: ${body.slice(0, 200)}`);
        err.status = res.status;
        throw err;
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? '';
    } catch (e) {
      const status = e?.status;
      const isRetryable = status === 429 || status === 500 || status === 503;
      lastError = e;
      if (!isRetryable) throw e;
    }
  }
  throw lastError;
}

// --- チャット相談窓口 -------------------------------------------------

export async function chatWithSecretary(history, apiKey, context = {}) {
  const { openTasks = [], upcoming = [] } = context;

  const taskLines = openTasks.slice(0, 15).map(t => `- ${t.title}`).join('\n') || '（未完了タスクなし）';
  const scheduleLines = upcoming.slice(0, 10).map(e => `- ${e.date ?? '日付未定'}${e.time ? ' ' + e.time : ''}: ${e.text}`).join('\n') || '（登録された予定なし）';

  const systemPrompt = `あなたは経営者・ビジネスパーソンをサポートする有能なAI秘書です。
簡潔かつ的確に、丁寧語（です・ます調）で日本語で応答してください。
必要に応じて箇条書きを使い、読みやすく整理して回答してください。

ユーザーの現在の未完了タスク:
${taskLines}

ユーザーの直近の予定・メモ:
${scheduleLines}

これらの情報を踏まえて、相談に乗ったり、優先順位のアドバイスをしたり、必要な準備を提案したりしてください。`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({ role: m.role, content: m.content })),
  ];

  return chatCompletion(apiKey, messages, { json: false });
}

// --- タスク・ToDo管理 ---------------------------------------------------

export async function organizeTasks(tasks, apiKey) {
  const list = tasks.map(t => `- id:${t.id} / ${t.title}`).join('\n');
  const prompt = `あなたは経営者の業務を整理するAI秘書です。以下の未完了タスクを分析し、優先順位付けとアドバイスをしてください。

タスク一覧:
${list}

各タスクについて、緊急度・重要度を踏まえた優先度（1が最優先）と、あいまいなタスクであれば最初の一歩となる短いアドバイスを付けてください。

出力形式（JSONのみ。説明文は一切不要）:
{
  "suggestions": [
    { "id": "タスクのid", "priority": 優先順位を表す1始まりの整数, "note": "短いアドバイスや最初の一歩（30文字以内、不要なら空文字）" }
  ],
  "focus": "今日まず取り組むべきことへの一言コメント（50文字以内）"
}`;

  const text = await chatCompletion(apiKey, [{ role: 'user', content: prompt }], { json: true });
  return parseJSON(text);
}

// --- スケジュール／メモ秘書 ----------------------------------------------

export async function parseScheduleEntry(rawText, apiKey) {
  const today = new Date().toISOString().slice(0, 10);
  const prompt = `あなたはスケジュール管理を行うAI秘書です。今日の日付は ${today} です。
以下のメモ・発言から、予定情報を抽出してください。日付や時刻の記載がなければ null にしてください。
「明日」「来週火曜」のような相対表現は今日の日付を基準に絶対日付（YYYY-MM-DD）に変換してください。

メモ: 「${rawText}」

出力形式（JSONのみ。説明文は一切不要）:
{
  "title": "予定・メモの短い見出し（20文字以内）",
  "date": "YYYY-MM-DD形式の日付、不明ならnull",
  "time": "HH:MM形式の時刻、不明ならnull",
  "kind": "date か time のどちらかが分かれば\\"schedule\\"、それ以外は\\"memo\\""
}`;

  const text = await chatCompletion(apiKey, [{ role: 'user', content: prompt }], { json: true });
  return parseJSON(text);
}

export async function suggestNextAction(scheduleEntries, apiKey) {
  const list = scheduleEntries.slice(0, 20)
    .map(e => `- [${e.kind === 'schedule' ? '予定' : 'メモ'}] ${e.date ?? ''}${e.time ? ' ' + e.time : ''} ${e.text}`)
    .join('\n') || '（登録なし）';

  const prompt = `あなたはAI秘書です。以下のユーザーの予定・メモ一覧を見て、次に取るべきアクションを短く提案してください。

予定・メモ一覧:
${list}

出力形式（JSONのみ。説明文は一切不要）:
{
  "advice": "次に取るべきアクションの提案（100文字以内）"
}`;

  const text = await chatCompletion(apiKey, [{ role: 'user', content: prompt }], { json: true });
  return parseJSON(text);
}

// --- 日報・議事録の要約 --------------------------------------------------

export async function summarizeReport(sourceText, apiKey) {
  const prompt = `あなたは優秀なAI秘書です。以下の日報・議事録・メモを整理・要約してください。

原文:
${sourceText}

出力形式（JSONのみ。説明文は一切不要）:
{
  "summary": "全体の要約（150文字以内）",
  "decisions": ["決定事項1", "決定事項2"],
  "actionItems": [
    { "task": "アクションアイテムの内容", "owner": "担当者（不明ならnull）", "due": "期限（不明ならnull）" }
  ],
  "followUps": ["次回までに確認・検討すべきこと1", "同2"]
}`;

  const text = await chatCompletion(apiKey, [{ role: 'user', content: prompt }], { json: true });
  return parseJSON(text);
}
