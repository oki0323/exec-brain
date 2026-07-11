const MODELS = ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-3.5-turbo'];

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

const BUSINESS_CONTEXTS = [
  'SaaS/IT企業', '小売・EC', '飲食チェーン', '製造業', '医療・ヘルスケア',
  '金融・保険', '教育', 'スタートアップの立ち上げ期', '地方の中小企業', '海外展開中の企業',
  '物流・運送', 'エンタメ・メディア',
];

const LATERAL_THEMES = [
  '日常のちょっとした違和感', 'ビジネス・オフィス', '歴史上の出来事', 'SF・近未来',
  '法廷・事件', '家族・人間関係', '旅行先でのハプニング', '学校・青春',
  '医療現場', 'スポーツ', '飲食店', '密室', 'ファンタジー世界', '海・船',
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

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
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 1.2,
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

export async function generateQuestion(skill, difficulty, apiKey, recentQuestions = []) {
  const context = pickRandom(BUSINESS_CONTEXTS);
  const avoidNote = recentQuestions.length
    ? `\n直近で出題した以下の問題とは異なる切り口・業界にしてください:\n${recentQuestions.map(q => `- ${q}`).join('\n')}\n`
    : '';
  const prompt = `あなたは経営者思考を鍛えるトレーニングアプリの問題作成者です。
以下の条件で問題を1問作成してください。

スキル領域: ${SKILL_LABELS[skill]}
難易度: ${DIFFICULTY_LABELS[difficulty]}
業界・シチュエーション: ${context}（この業界設定を活かした具体的な問題にしてください）
${avoidNote}
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

export async function generateLateralQuiz(difficulty, apiKey, recentTitles = []) {
  const theme = pickRandom(LATERAL_THEMES);
  const avoidNote = recentTitles.length
    ? `\n直近で出題した以下のタイトルとは異なる状況・トリックにしてください: ${recentTitles.join('、')}\n`
    : '';
  const prompt = `あなたは「水平思考クイズ（ウミガメのスープ）」の出題者です。
以下の条件で新しい問題を1問作成してください。プレイヤーは「はい/いいえ」で答えられる質問を重ねながら、隠された真相を推理します。

テーマ: ${theme}
難易度: ${DIFFICULTY_LABELS[difficulty]}
${avoidNote}
注意: 「トンネルを抜けたら逮捕された」「コーヒーを見て青ざめた」「氷の弾丸」など、水平思考クイズでよく使われる定番ネタをそのまま使うのは避け、上記テーマに沿った独自性のある状況を考えてください。

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
