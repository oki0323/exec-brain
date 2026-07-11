import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { generateQuestion } from '../services/openai';

const SKILLS = [
  { key: 'logical', label: 'ロジカルシンキング', emoji: '🔵', color: 'var(--logical)' },
  { key: 'creative', label: '発想力', emoji: '🟡', color: 'var(--creative)' },
  { key: 'numerical', label: '数字感覚', emoji: '🟢', color: 'var(--numerical)' },
  { key: 'decision', label: '意思決定', emoji: '🔴', color: 'var(--decision)' },
  { key: 'verbal', label: '言語化', emoji: '🩵', color: 'var(--verbal)' },
];

const DIFFICULTY_LABELS = { beginner: '初級', intermediate: '中級', advanced: '上級' };

function getTodaySkill() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return SKILLS[dayOfYear % SKILLS.length];
}

export default function Home() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [streak] = useState(storage.getStreak());
  const [playedToday] = useState(storage.hasPlayedToday());
  const scores = storage.getScores();
  const difficulty = storage.getDifficulty();
  const apiKey = storage.getApiKey();
  const todaySkill = getTodaySkill();

  async function handleStart() {
    const key = storage.getApiKey();
    if (!key) {
      setError('APIキーが設定されていません。設定画面から入力してください。');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const q = await generateQuestion(todaySkill.key, difficulty, key);
      navigate('/question', { state: { question: q, skill: todaySkill } });
    } catch (e) {
      console.error('generateQuestion error:', e);
      setError(`問題の生成に失敗しました: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const avgScore = totalScore > 0 ? Math.round(totalScore / Object.values(scores).filter(v => v > 0).length) || 0 : 0;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>
            Exec Brain
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 100,
            padding: '6px 14px',
          }}>
            <span style={{ fontSize: 18 }}>🔥</span>
            <span style={{ fontWeight: 700, color: 'var(--warning)' }}>{streak}</span>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>日連続</span>
          </div>
        </div>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
          {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
        </p>
      </div>

      {/* Today's challenge */}
      <div className="card" style={{ marginBottom: 16, borderColor: playedToday ? 'var(--success)' : todaySkill.color }}>
        <div style={{ marginBottom: 12 }}>
          <span className="badge" style={{
            background: `${todaySkill.color}22`,
            color: todaySkill.color,
            marginBottom: 8,
            display: 'inline-flex',
          }}>
            {todaySkill.emoji} {todaySkill.label}
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>
              {DIFFICULTY_LABELS[difficulty]}
            </span>
            {playedToday && (
              <span className="badge" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success)' }}>
                ✓ 完了
              </span>
            )}
          </div>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
          今日のデイリーチャレンジ
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 16 }}>
          {playedToday
            ? '本日分は完了しました。明日また挑戦しましょう！'
            : `${todaySkill.label}の問題に挑戦しましょう。`}
        </p>

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
          className={`btn btn-primary btn-full btn-lg`}
          onClick={handleStart}
          disabled={loading}
          style={{ opacity: playedToday ? 0.7 : 1 }}
        >
          {loading ? (
            <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> 生成中...</>
          ) : playedToday ? '再挑戦する' : '挑戦する →'}
        </button>
      </div>

      {/* Lateral thinking quiz entry */}
      <div
        className="card"
        onClick={() => navigate('/lateral')}
        style={{ marginBottom: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
      >
        <span style={{ fontSize: 28 }}>🧩</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>水平思考クイズ</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
            質問を重ねて隠された真相を推理しよう
          </div>
        </div>
        <span style={{ color: 'var(--text2)' }}>→</span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>{avgScore}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>平均スコア</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--warning)' }}>{streak}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>連続日数</div>
        </div>
      </div>

      {/* Skill overview */}
      <div>
        <p className="section-title">スキル概要</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SKILLS.map(skill => {
            const score = scores[skill.key] ?? 0;
            return (
              <div key={skill.key} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
              }}>
                <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{skill.emoji}</span>
                <span style={{ fontSize: 13, color: 'var(--text2)', width: 80, flexShrink: 0 }}>{skill.label}</span>
                <div style={{ flex: 1, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${score}%`,
                    background: skill.color,
                    borderRadius: 3,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: skill.color, width: 30, textAlign: 'right' }}>
                  {score}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
