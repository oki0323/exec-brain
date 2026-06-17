import { GoogleGenerativeAI } from '@google/generative-ai';

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

function getClient(apiKey) {
  return new GoogleGenerativeAI(apiKey);
}

export async function generateQuestion(skill, difficulty, apiKey) {
  const client = getClient(apiKey);
  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `あなたは経営者思考を鍛えるトレーニングアプリの問題作成者です。
以下の条件で問題を1問作成してください。

スキル領域: ${SKILL_LABELS[skill]}
難易度: ${DIFFICULTY_LABELS[difficulty]}

出力形式（JSON）:
{
  "title": "問題タイトル（15文字以内）",
  "question": "問題文（100〜200文字程度）",
  "hint": "考えるヒント（50文字以内）",
  "timeLimit": 分数（5〜10の整数）
}

注意:
- 実際のビジネスシーンを想定したリアルな問題にしてください
- 回答者が自分の考えを記述できる開放的な問題にしてください
- JSONのみを返してください（説明文は不要）`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const json = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(json);
}

export async function evaluateAnswer(question, answer, skill, apiKey) {
  const client = getClient(apiKey);
  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `あなたは経営者思考を評価する厳格なコーチです。
以下の問題と回答を評価してください。

スキル領域: ${SKILL_LABELS[skill]}
問題: ${question}
回答: ${answer}

出力形式（JSON）:
{
  "score": 0〜100の整数,
  "summary": "総合評価コメント（50文字以内）",
  "strengths": ["良かった点1", "良かった点2"],
  "improvements": ["改善点1", "改善点2", "改善点3"],
  "modelAnswer": "模範解答例（150〜250文字）",
  "nextStep": "次に意識すべきこと（50文字以内）"
}

採点基準:
- 論理的一貫性・構造
- 問題の本質を捉えているか
- 具体性・実行可能性
- ${SKILL_LABELS[skill]}の観点

JSONのみを返してください。`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const json = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(json);
}

export async function generateDemoQuestion(apiKey) {
  return generateQuestion('decision', 'beginner', apiKey);
}
