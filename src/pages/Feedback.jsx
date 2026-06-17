import { useLocation, useNavigate } from 'react-router-dom';

function ScoreRing({ score, color }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div style={{ position: 'relative', width: 100, height: 100 }}>
      <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--bg3)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: 24, fontWeight: 700, color }}>{score}</span>
        <span style={{ fontSize: 10, color: 'var(--text2)' }}>点</span>
      </div>
    </div>
  );
}

function scoreColor(s) {
  if (s >= 80) return 'var(--success)';
  if (s >= 60) return 'var(--accent)';
  if (s >= 40) return 'var(--warning)';
  return 'var(--danger)';
}

export default function Feedback() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { feedback, question, skill, answer } = state ?? {};

  if (!feedback) {
    navigate('/');
    return null;
  }

  const color = scoreColor(feedback.score);

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>フィードバック</h1>
        <span className="badge" style={{ background: `${skill?.color}22`, color: skill?.color }}>
          {skill?.emoji} {skill?.label}
        </span>
      </div>

      {/* Score */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16, borderColor: color }}>
        <ScoreRing score={feedback.score} color={color} />
        <div>
          <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 4 }}>総合評価</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>
            {feedback.summary}
          </div>
        </div>
      </div>

      {/* Strengths */}
      <div style={{ marginBottom: 16 }}>
        <p className="section-title">✅ 良かった点</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(feedback.strengths ?? []).map((s, i) => (
            <div key={i} style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: 14,
              color: 'var(--text)',
            }}>
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Improvements */}
      <div style={{ marginBottom: 16 }}>
        <p className="section-title">📌 改善点</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(feedback.improvements ?? []).map((s, i) => (
            <div key={i} style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: 14,
              color: 'var(--text)',
            }}>
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Model answer */}
      <div style={{ marginBottom: 16 }}>
        <p className="section-title">🏆 模範解答例</p>
        <div className="card" style={{ borderColor: 'var(--accent)' }}>
          <p style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: 14 }}>{feedback.modelAnswer}</p>
        </div>
      </div>

      {/* Next step */}
      {feedback.nextStep && (
        <div style={{
          background: 'var(--accent-dim)',
          border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 16px',
          marginBottom: 24,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 18 }}>🎯</span>
          <div>
            <div style={{ fontSize: 12, color: 'var(--accent-light)', fontWeight: 600, marginBottom: 4 }}>
              次に意識すること
            </div>
            <div style={{ fontSize: 14, color: 'var(--text)' }}>{feedback.nextStep}</div>
          </div>
        </div>
      )}

      {/* Your answer */}
      <details style={{ marginBottom: 24 }}>
        <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
          あなたの回答を確認する
        </summary>
        <div className="card" style={{ marginTop: 8 }}>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.8 }}>{answer}</p>
        </div>
      </details>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/')}>
          ホームへ戻る
        </button>
        <button className="btn btn-ghost btn-full" onClick={() => navigate('/tracker')}>
          成長トラッカーを見る 📊
        </button>
      </div>
    </div>
  );
}
