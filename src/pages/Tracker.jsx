import { storage } from '../services/storage';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

const SKILLS = [
  { key: 'logical', label: 'ロジカル', color: 'var(--logical)', fullLabel: 'ロジカルシンキング' },
  { key: 'creative', label: '発想力', color: 'var(--creative)', fullLabel: '発想力' },
  { key: 'numerical', label: '数字感覚', color: 'var(--numerical)', fullLabel: '数字・財務感覚' },
  { key: 'decision', label: '意思決定', color: 'var(--decision)', fullLabel: '意思決定' },
  { key: 'verbal', label: '言語化', color: 'var(--verbal)', fullLabel: '言語化' },
];

function ScoreBadge({ score }) {
  if (score >= 80) return <span style={{ color: 'var(--success)', fontWeight: 700 }}>{score}</span>;
  if (score >= 60) return <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{score}</span>;
  if (score >= 40) return <span style={{ color: 'var(--warning)', fontWeight: 700 }}>{score}</span>;
  return <span style={{ color: 'var(--text2)', fontWeight: 700 }}>{score || '—'}</span>;
}

export default function Tracker() {
  const scores = storage.getScores();
  const history = storage.getHistory();
  const streak = storage.getStreak();

  const radarData = SKILLS.map(s => ({
    subject: s.label,
    score: scores[s.key] ?? 0,
    fullMark: 100,
  }));

  const totalEntries = history.length;
  const avg = totalEntries > 0
    ? Math.round(history.reduce((a, h) => a + (h.score ?? 0), 0) / totalEntries)
    : 0;

  return (
    <div className="page">
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>成長トラッカー</h1>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: '平均スコア', value: avg || '—', color: 'var(--accent)' },
          { label: '総回答数', value: totalEntries, color: 'var(--verbal)' },
          { label: '連続日数', value: streak, color: 'var(--warning)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: '14px 10px' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Radar chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <p className="section-title">スキルバランス</p>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'var(--text2)', fontSize: 12 }}
            />
            <Radar
              name="スコア"
              dataKey="score"
              stroke="var(--accent)"
              fill="var(--accent)"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: 13,
              }}
              formatter={(val) => [`${val}点`, 'スコア']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Skill breakdown */}
      <div style={{ marginBottom: 24 }}>
        <p className="section-title">スキル詳細</p>
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
                padding: '12px 16px',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: skill.color, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: 'var(--text)', flex: 1 }}>{skill.fullLabel}</span>
                <div style={{ width: 100, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${score}%`,
                    background: skill.color,
                    borderRadius: 3,
                    transition: 'width 0.5s',
                  }} />
                </div>
                <span style={{ width: 28, textAlign: 'right', fontSize: 14 }}>
                  <ScoreBadge score={score} />
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          <p className="section-title">最近の回答履歴</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.slice(0, 10).map((h, i) => {
              const skill = SKILLS.find(s => s.key === h.skill);
              const date = new Date(h.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
              return (
                <div key={i} style={{
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <div style={{
                    width: 6,
                    height: 36,
                    borderRadius: 3,
                    background: skill?.color ?? 'var(--border)',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.skillLabel}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{date}</div>
                  </div>
                  <ScoreBadge score={h.score} />
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>点</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {history.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text2)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <p>まだ回答履歴がありません。<br />デイリーチャレンジに挑戦してみましょう！</p>
        </div>
      )}
    </div>
  );
}
