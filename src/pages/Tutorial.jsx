import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';

const SLIDES = [
  {
    emoji: '🧠',
    title: 'Exec Brain へようこそ',
    body: '経営者思考を毎日5〜10分で鍛えるAIトレーニングアプリです。毎日1問の問題に答えて、AIからリアルなフィードバックを受け取りましょう。',
  },
  {
    emoji: '🎯',
    title: '5つのスキル領域',
    body: null,
    skills: [
      { color: 'var(--logical)', icon: '🔵', name: 'ロジカルシンキング', desc: '論理・MECE・構造化' },
      { color: 'var(--creative)', icon: '🟡', name: '発想力', desc: 'クリエイティブ思考' },
      { color: 'var(--numerical)', icon: '🟢', name: '数字・財務感覚', desc: '概算・ROI・利益計算' },
      { color: 'var(--decision)', icon: '🔴', name: '意思決定', desc: '判断力・優先順位付け' },
      { color: 'var(--verbal)', icon: '🩵', name: '言語化', desc: 'アウトプット・表現力' },
    ],
  },
  {
    emoji: '✏️',
    title: '毎日の使い方',
    steps: [
      '① 今日の問題が自動で出題される',
      '② テキストで自分の考えを記述する',
      '③ AIが採点＆改善フィードバックを返す',
      '④ 成長トラッカーでスキルの伸びを確認',
    ],
  },
  {
    emoji: '📈',
    title: '成長を可視化',
    body: 'レーダーチャートで5つのスキルのバランスをひと目で確認。連続学習日数（ストリーク）でモチベーションを維持しましょう。',
  },
  {
    emoji: '🔑',
    title: 'APIキーを設定しよう',
    body: 'Google AI Studio でGemini APIキーを取得し、設定画面から入力してください。APIキーはブラウザ内にのみ保存されます。',
    note: '設定 → APIキー入力 から後で変更できます',
  },
];

export default function Tutorial({ onFinish }) {
  const [slide, setSlide] = useState(0);
  const navigate = useNavigate();

  const isLast = slide === SLIDES.length - 1;
  const current = SLIDES[slide];

  function handleFinish() {
    storage.setTutorialDone();
    onFinish?.();
    navigate('/');
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      padding: '24px 20px',
      maxWidth: 480,
      margin: '0 auto',
    }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
        {SLIDES.map((_, i) => (
          <div key={i} style={{
            width: i === slide ? 24 : 8,
            height: 8,
            borderRadius: 4,
            background: i === slide ? 'var(--accent)' : 'var(--border)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {/* Slide content */}
      <div key={slide} style={{ flex: 1, animation: 'fadeIn 0.3s ease' }}>
        <div style={{ fontSize: 64, textAlign: 'center', marginBottom: 20 }}>{current.emoji}</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', textAlign: 'center', marginBottom: 16 }}>
          {current.title}
        </h2>

        {current.body && (
          <p style={{ color: 'var(--text2)', textAlign: 'center', lineHeight: 1.8, marginBottom: 20 }}>
            {current.body}
          </p>
        )}

        {current.skills && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {current.skills.map(s => (
              <div key={s.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
              }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: s.color }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {current.steps && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {current.steps.map(s => (
              <div key={s} style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 16px',
                color: 'var(--text)',
                fontWeight: 500,
              }}>
                {s}
              </div>
            ))}
          </div>
        )}

        {current.note && (
          <div style={{
            marginTop: 20,
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: 13,
            color: 'var(--accent-light)',
            textAlign: 'center',
          }}>
            💡 {current.note}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
        {slide > 0 && (
          <button className="btn btn-ghost" onClick={() => setSlide(s => s - 1)} style={{ flex: 1 }}>
            戻る
          </button>
        )}
        {isLast ? (
          <button className="btn btn-primary btn-lg" onClick={handleFinish} style={{ flex: 1 }}>
            はじめる 🚀
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setSlide(s => s + 1)} style={{ flex: slide === 0 ? 'unset' : 1, width: slide === 0 ? '100%' : undefined }}>
            次へ →
          </button>
        )}
      </div>

      {slide < SLIDES.length - 1 && (
        <button
          onClick={handleFinish}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text2)',
            fontSize: 13,
            cursor: 'pointer',
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          スキップ
        </button>
      )}
    </div>
  );
}
