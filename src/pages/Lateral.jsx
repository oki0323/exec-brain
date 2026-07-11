import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { generateLateralQuiz, answerLateralQuestion, judgeLateralGuess } from '../services/gemini';

const DIFFICULTY_LABELS = { beginner: '初級', intermediate: '中級', advanced: '上級' };

const ANSWER_COLOR = {
  'はい': 'var(--success)',
  'いいえ': 'var(--danger)',
  'わからない／関係ない': 'var(--text2)',
};

const VERDICT_COLOR = {
  '正解': 'var(--success)',
  '惜しい': 'var(--warning)',
  '不正解': 'var(--danger)',
};

export default function Lateral() {
  const navigate = useNavigate();
  const difficulty = storage.getDifficulty();

  const [phase, setPhase] = useState('start'); // start | playing | result
  const [puzzle, setPuzzle] = useState(null);
  const [qaLog, setQaLog] = useState([]);
  const [questionInput, setQuestionInput] = useState('');
  const [guessInput, setGuessInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [loadingPuzzle, setLoadingPuzzle] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingGuess, setLoadingGuess] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  function requireApiKey() {
    const key = storage.getApiKey();
    if (!key) {
      setError('APIキーが設定されていません。設定画面から入力してください。');
      return null;
    }
    return key;
  }

  async function handleStart() {
    const key = requireApiKey();
    if (!key) return;
    setLoadingPuzzle(true);
    setError('');
    try {
      const q = await generateLateralQuiz(difficulty, key);
      setPuzzle(q);
      setQaLog([]);
      setShowHint(false);
      setGuessInput('');
      setResult(null);
      setPhase('playing');
    } catch (e) {
      console.error('generateLateralQuiz error:', e);
      setError(`問題の生成に失敗しました: ${e?.message ?? e}`);
    } finally {
      setLoadingPuzzle(false);
    }
  }

  async function handleAsk() {
    const question = questionInput.trim();
    if (!question) return;
    const key = requireApiKey();
    if (!key) return;
    setLoadingQuestion(true);
    setError('');
    try {
      const res = await answerLateralQuestion(puzzle.situation, puzzle.truth, question, key);
      setQaLog(log => [...log, { question, answer: res.answer, note: res.note }]);
      setQuestionInput('');
    } catch (e) {
      console.error('answerLateralQuestion error:', e);
      setError(`質問への回答取得に失敗しました: ${e?.message ?? e}`);
    } finally {
      setLoadingQuestion(false);
    }
  }

  async function handleGuess() {
    const guess = guessInput.trim();
    if (guess.length < 10) {
      setError('もう少し具体的に推理を書いてみましょう（10文字以上）');
      return;
    }
    const key = requireApiKey();
    if (!key) return;
    setLoadingGuess(true);
    setError('');
    try {
      const res = await judgeLateralGuess(puzzle.situation, puzzle.truth, guess, key);
      setResult(res);
      storage.addLateralHistory({
        title: puzzle.title,
        situation: puzzle.situation,
        guess,
        score: res.score,
        verdict: res.verdict,
        questionCount: qaLog.length,
      });
      setPhase('result');
    } catch (e) {
      console.error('judgeLateralGuess error:', e);
      setError(`推理の判定に失敗しました: ${e?.message ?? e}`);
    } finally {
      setLoadingGuess(false);
    }
  }

  function handleReplay() {
    setPhase('start');
    handleStart();
  }

  if (phase === 'start') {
    return (
      <div className="page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← 戻る</button>
          <span className="badge" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>
            {DIFFICULTY_LABELS[difficulty]}
          </span>
        </div>

        <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧩</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            水平思考クイズ
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.8 }}>
            一見不可解な状況が出題されます。「はい／いいえ」で答えられる質問を重ねて手がかりを集め、
            隠された真相を推理してください。
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: 13,
            color: '#fca5a5',
            marginBottom: 12,
          }}>
            {error}
          </div>
        )}

        <button className="btn btn-primary btn-full btn-lg" onClick={handleStart} disabled={loadingPuzzle}>
          {loadingPuzzle ? (
            <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> 問題を生成中...</>
          ) : '問題を出題する →'}
        </button>
      </div>
    );
  }

  if (phase === 'result') {
    const color = VERDICT_COLOR[result.verdict] ?? 'var(--accent)';
    return (
      <div className="page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>結果</h1>
          <span className="badge" style={{ background: `${color}22`, color }}>{result.verdict}</span>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16, borderColor: color }}>
          <div style={{ fontSize: 36, fontWeight: 700, color }}>{result.score}</div>
          <div>
            <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 4 }}>推理スコア</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>
              {result.comment}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <p className="section-title">🔎 真相</p>
          <div className="card" style={{ borderColor: 'var(--accent)' }}>
            <p style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: 14 }}>{result.truthReveal}</p>
          </div>
        </div>

        <details style={{ marginBottom: 24 }}>
          <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
            あなたの推理と質問履歴を確認する（{qaLog.length}問）
          </summary>
          <div className="card" style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {qaLog.map((qa, i) => (
              <div key={i} style={{ fontSize: 13, color: 'var(--text2)' }}>
                Q{i + 1}. {qa.question}
                <span style={{ color: ANSWER_COLOR[qa.answer] ?? 'var(--text)', fontWeight: 600, marginLeft: 8 }}>
                  → {qa.answer}
                </span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, fontSize: 14, color: 'var(--text)' }}>
              最終推理: {guessInput}
            </div>
          </div>
        </details>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-primary btn-full btn-lg" onClick={handleReplay}>
            もう一問挑戦する 🧩
          </button>
          <button className="btn btn-ghost btn-full" onClick={() => navigate('/')}>
            ホームへ戻る
          </button>
        </div>
      </div>
    );
  }

  // playing
  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← 戻る</button>
        <span className="badge" style={{ background: 'var(--accent-dim)', color: 'var(--accent-light)' }}>
          🧩 水平思考
        </span>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
          {puzzle.title}
        </h2>
        <p style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: 15 }}>{puzzle.situation}</p>

        {puzzle.firstHint && (
          showHint ? (
            <div style={{
              marginTop: 16,
              padding: '10px 14px',
              background: 'var(--accent-dim)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              color: 'var(--accent-light)',
            }}>
              💡 ヒント: {puzzle.firstHint}
            </div>
          ) : (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={() => setShowHint(true)}>
              💡 ヒントを見る
            </button>
          )
        )}
      </div>

      {/* Q&A log */}
      {qaLog.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p className="section-title">質問履歴（{qaLog.length}問）</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
            {qaLog.map((qa, i) => (
              <div key={i} className="card" style={{ padding: '10px 14px' }}>
                <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>Q. {qa.question}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: ANSWER_COLOR[qa.answer] ?? 'var(--text)' }}>
                  {qa.answer}
                  {qa.note && <span style={{ fontWeight: 400, color: 'var(--text2)', marginLeft: 6 }}>（{qa.note}）</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ask question */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
          「はい／いいえ」で答えられる質問をする
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={questionInput}
            onChange={e => setQuestionInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !loadingQuestion) handleAsk(); }}
            placeholder="例: その人物は男性ですか？"
            style={{ flex: 1, minWidth: 0 }}
          />
          <button
            className="btn btn-primary"
            onClick={handleAsk}
            disabled={loadingQuestion || !questionInput.trim()}
            style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            {loadingQuestion ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : '質問'}
          </button>
        </div>
      </div>

      {/* Final guess */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
          真相を推理する
        </label>
        <textarea
          value={guessInput}
          onChange={e => setGuessInput(e.target.value)}
          placeholder="集めた手がかりから、真相だと思う内容を書いてください。"
          rows={5}
        />
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          fontSize: 13,
          color: '#fca5a5',
          marginBottom: 12,
        }}>
          {error}
        </div>
      )}

      <button
        className="btn btn-primary btn-full btn-lg"
        onClick={handleGuess}
        disabled={loadingGuess || guessInput.trim().length < 10}
      >
        {loadingGuess ? (
          <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> 判定中...</>
        ) : '推理を送信して答え合わせ →'}
      </button>
    </div>
  );
}
