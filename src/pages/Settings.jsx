import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';

const DIFFICULTIES = [
  { key: 'beginner', label: '初級', desc: '基礎的なビジネス思考を鍛える' },
  { key: 'intermediate', label: '中級', desc: 'より実践的な経営判断を要求' },
  { key: 'advanced', label: '上級', desc: '高度な戦略思考・複合的問題' },
];

export default function Settings() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState(storage.getApiKey());
  const [showKey, setShowKey] = useState(false);
  const [difficulty, setDifficulty] = useState(storage.getDifficulty());
  const [saved, setSaved] = useState(false);

  function handleSave() {
    storage.setApiKey(apiKey.trim());
    storage.setDifficulty(difficulty);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleResetTutorial() {
    storage.resetTutorial();
    navigate('/tutorial');
  }

  function handleResetData() {
    if (window.confirm('すべての履歴・スコアをリセットしますか？この操作は取り消せません。')) {
      localStorage.clear();
      window.location.reload();
    }
  }

  return (
    <div className="page">
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>設定</h1>

      {/* API Key */}
      <div style={{ marginBottom: 24 }}>
        <p className="section-title">Gemini APIキー</p>
        <div className="card">
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>
            Google AI Studio で取得したAPIキーを入力してください。
            キーはブラウザ内（localStorage）にのみ保存されます。
          </p>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIza..."
              style={{ paddingRight: 44 }}
            />
            <button
              onClick={() => setShowKey(v => !v)}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text2)',
                fontSize: 16,
                padding: 4,
              }}
            >
              {showKey ? '🙈' : '👁'}
            </button>
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: 'var(--accent-light)', textDecoration: 'none' }}
          >
            → Google AI Studio でAPIキーを取得する
          </a>
        </div>
      </div>

      {/* Difficulty */}
      <div style={{ marginBottom: 24 }}>
        <p className="section-title">難易度</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DIFFICULTIES.map(d => (
            <button
              key={d.key}
              onClick={() => setDifficulty(d.key)}
              style={{
                background: difficulty === d.key ? 'var(--accent-dim)' : 'var(--bg2)',
                border: `1px solid ${difficulty === d.key ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '14px 16px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: `2px solid ${difficulty === d.key ? 'var(--accent)' : 'var(--border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {difficulty === d.key && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                )}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: difficulty === d.key ? 'var(--accent)' : 'var(--text)' }}>
                  {d.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{d.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        className="btn btn-primary btn-full btn-lg"
        onClick={handleSave}
        style={{ marginBottom: 16 }}
      >
        {saved ? '✓ 保存しました' : '設定を保存'}
      </button>

      {/* Other actions */}
      <div style={{ marginBottom: 12 }}>
        <p className="section-title">その他</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn-ghost btn-full" onClick={handleResetTutorial}>
            チュートリアルをもう一度見る
          </button>
          <button className="btn btn-danger btn-full" onClick={handleResetData}>
            データをリセットする
          </button>
        </div>
      </div>

      {/* App info */}
      <div style={{
        textAlign: 'center',
        marginTop: 32,
        paddingTop: 16,
        borderTop: '1px solid var(--border)',
        color: 'var(--text2)',
        fontSize: 12,
      }}>
        <div style={{ fontSize: 20, marginBottom: 4 }}>🧠</div>
        <div>Exec Brain v1.0</div>
        <div style={{ marginTop: 4 }}>Powered by Gemini 2.5 Flash</div>
      </div>
    </div>
  );
}
