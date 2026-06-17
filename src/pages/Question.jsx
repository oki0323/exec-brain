import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { evaluateAnswer } from '../services/gemini';

export default function Question() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  const question = state?.question;
  const skill = state?.skill;

  useEffect(() => {
    if (!question) { navigate('/'); return; }
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  async function handleSubmit() {
    if (answer.trim().length < 30) {
      setError('もう少し詳しく書いてみましょう（30文字以上）');
      return;
    }
    clearInterval(timerRef.current);
    setLoading(true);
    setError('');
    try {
      const apiKey = storage.getApiKey();
      const feedback = await evaluateAnswer(question.question, answer, skill.key, apiKey);
      storage.updateScore(skill.key, feedback.score);
      storage.addHistory({
        skill: skill.key,
        skillLabel: skill.label,
        question: question.question,
        answer,
        score: feedback.score,
        elapsed,
      });
      storage.updateStreak();
      navigate('/feedback', { state: { feedback, question, skill, answer } });
    } catch (e) {
      console.error('evaluateAnswer error:', e);
      setError(`フィードバックの取得に失敗しました: ${e?.message ?? String(e)}`);
      setLoading(false);
    }
  }

  if (!question) return null;

  const charCount = answer.length;
  const isReady = answer.trim().length >= 30;
  const timeLimit = (question.timeLimit ?? 10) * 60;
  const timePercent = Math.min((elapsed / timeLimit) * 100, 100);
  const isOverTime = elapsed > timeLimit;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← 戻る</button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge" style={{
            background: `${skill.color}22`,
            color: skill.color,
          }}>
            {skill.emoji} {skill.label}
          </span>
          <span style={{
            fontSize: 14,
            fontWeight: 700,
            color: isOverTime ? 'var(--danger)' : elapsed > timeLimit * 0.8 ? 'var(--warning)' : 'var(--text2)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            ⏱ {formatTime(elapsed)}
          </span>
        </div>
      </div>

      {/* Time progress bar */}
      <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${timePercent}%`,
          background: isOverTime ? 'var(--danger)' : timePercent > 80 ? 'var(--warning)' : 'var(--accent)',
          transition: 'width 1s linear',
        }} />
      </div>

      {/* Question */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
          {question.title}
        </h2>
        <p style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: 15 }}>
          {question.question}
        </p>
        {question.hint && (
          <div style={{
            marginTop: 16,
            padding: '10px 14px',
            background: 'var(--accent-dim)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            color: 'var(--accent-light)',
          }}>
            💡 ヒント: {question.hint}
          </div>
        )}
      </div>

      {/* Answer area */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>あなたの回答</label>
          <span style={{ fontSize: 12, color: charCount < 30 ? 'var(--text2)' : 'var(--success)' }}>
            {charCount} 文字 {charCount < 30 ? `（あと ${30 - charCount} 文字）` : '✓'}
          </span>
        </div>
        <textarea
          ref={textareaRef}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="自分の考えを自由に記述してください。構造化して書くと高評価につながります。"
          rows={8}
          style={{ minHeight: 160 }}
          autoFocus
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
        onClick={handleSubmit}
        disabled={loading || !isReady}
      >
        {loading ? (
          <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> AIが採点中...</>
        ) : 'AIにフィードバックをもらう →'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text2)', marginTop: 12 }}>
        目安時間: {question.timeLimit ?? 10}分
      </p>
    </div>
  );
}
