import { GoogleGenAI } from '@google/genai';

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

const SKILL_LABELS = {
  logical: 'ロジカルシンキング（論理的思考・MECE・構造化）',
  creative: '発想力・クリエイティブ思考',
  numerical: '数字・財務感覚（概算・ROI・利益計算）',
  decision: '意思決定・判断力',
  verbal: '言語化・アウトプット力',
};

const DIFFICULTY_LABELS = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
};

function parseJSON(text) {
  // Strip markdown code fences
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  // Try direct parse first
  try { return JSON.parse(cleaned); } catch {}

  // Extract first {...} block
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);

  throw new Error(`JSONパースに失敗しました: ${cleaned.slice(0, 200)}`);
}

async function generate(apiKey, prompt) {
  const ai = new GoogleGenAI({ apiKey });
  let lastError;
  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({ model, contents: prompt });
      return response.text;
    } catch (e) {
      const status = e?.status ?? e?.message ?? '';
      const is503 = String(status).includes('503') || String(e).includes('UNAVAILABLE');
      lastError = e;
      if (!is503) throw e;
    }
  }
  throw lastError;
}

export async function generateQuestion(skill, difficulty, apiKey) {
  const prompt = `あなたは経営者思考を鍛えるトレーニングアプリの問題作成者です。
以下の条件で問題を1問作成してください。

スキル領域: ${SKILL_LABELS[skill]}
難易度: ${DIFFICULTY_LABELS[difficulty]}

出力形式（JSONのみ。説明文は一切不要）:
{
  "title": "問題タイトル（15文字以内）",
  "question": "問題文（100〜200文字程度）",
  "hint": "考えるヒント（50文字以内）",
  "timeLimit": 分数（5〜10の整数）
}`;

  const text = await generate(apiKey, prompt);
  return parseJSON(text);
}

export async function generateLateralQuiz(difficulty, apiKey) {
  const prompt = `あなたは「水平思考クイズ（ウミガメのスープ）」の出題者です。
以下の条件で新しい問題を1問作成してください。プレイヤーは「はい/いいえ」で答えられる質問を重ねながら、隠された真相を推理します。

難易度: ${DIFFICULTY_LABELS[difficulty]}

出力形式（JSONのみ。説明文は一切不要）:
{
  "title": "問題タイトル（20文字以内）",
  "situation": "プレイヤーに提示する一見不可解な状況（100〜200文字程度）",
  "truth": "実際の真相・全容（150〜300文字程度。プレイヤーには非公開の情報）",
  "firstHint": "行き詰まった時に使える最初のヒント（40文字以内）"
}`;

  const text = await generate(apiKey, prompt);
  return parseJSON(text);
}

export async function answerLateralQuestion(situation, truth, question, apiKey) {
  const prompt = `あなたは「水平思考クイズ」の出題者です。以下の真相をもとに、プレイヤーの質問に回答してください。

不可解な状況: ${situation}
真相（非公開）: ${truth}
プレイヤーの質問: 「${question}」

回答ルール:
- 質問の内容が真相に照らして正しいなら「はい」
- 誤っているなら「いいえ」
- 状況・真相から判断できない、関係がない、または質問が曖昧な場合は「わからない／関係ない」
- 真相そのものを書かず、短く端的に回答する

出力形式（JSONのみ。説明文は一切不要）:
{
  "answer": "はい" または "いいえ" または "わからない／関係ない",
  "note": "補足コメント（20文字以内。不要なら空文字）"
}`;

  const text = await generate(apiKey, prompt);
  return parseJSON(text);
}

export async function judgeLateralGuess(situation, truth, guess, apiKey) {
  const prompt = `あなたは「水平思考クイズ」の出題者です。プレイヤーが推理した内容を、実際の真相と比較して評価してください。

不可解な状況: ${situation}
真相: ${truth}
プレイヤーの推理: ${guess}

出力形式（JSONのみ。説明文は一切不要）:
{
  "score": 0〜100の整数（真相にどれだけ近いか）,
  "verdict": "正解" または "惜しい" または "不正解" のいずれか,
  "comment": "評価コメント（80文字以内）",
  "truthReveal": "正式な真相の説明文（150〜250文字）"
}`;

  const text = await generate(apiKey, prompt);
  return parseJSON(text);
}

export async function evaluateAnswer(question, answer, skill, apiKey) {
  const prompt = `あなたは経営者思考を評価する厳格なコーチです。
以下の問題と回答を評価してください。

スキル領域: ${SKILL_LABELS[skill]}
問題: ${question}
回答: ${answer}

出力形式（JSONのみ。説明文は一切不要）:
{
  "score": 0〜100の整数,
  "summary": "総合評価コメント（50文字以内）",
  "strengths": ["良かった点1", "良かった点2"],
  "improvements": ["改善点1", "改善点2", "改善点3"],
  "modelAnswer": "模範解答例（150〜250文字）",
  "nextStep": "次に意識すべきこと（50文字以内）"
}`;

  const text = await generate(apiKey, prompt);
  return parseJSON(text);
}
