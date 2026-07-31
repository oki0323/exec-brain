import { useState } from 'react';
import { storage } from '../services/storage';

export default function Settings() {
  const [apiKey, setApiKey] = useState(storage.getApiKey());
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    storage.setApiKey(apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleResetData() {
    if (window.confirm('タスク・予定・要約・チャット履歴をすべて削除しますか？この操作は取り消せません。')) {
      localStorage.clear();
      window.location.reload();
    }
  }

  return (
    <div className="page">
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>設定</h1>

      <div style={{ marginBottom: 24 }}>
        <p className="section-title">OpenAI APIキー</p>
        <div className="card">
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>
            OpenAI Platform で取得したAPIキーを入力してください。
            キーはブラウザ内（localStorage）にのみ保存されます。
          </p>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..."
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
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: 'var(--accent-light)', textDecoration: 'none' }}
          >
            → OpenAI Platform でAPIキーを取得する
          </a>
        </div>
      </div>

      <button
        className="btn btn-primary btn-full btn-lg"
        onClick={handleSave}
        style={{ marginBottom: 16 }}
      >
        {saved ? '✓ 保存しました' : '設定を保存'}
      </button>

      <div style={{ marginBottom: 12 }}>
        <p className="section-title">その他</p>
        <button className="btn btn-danger btn-full" onClick={handleResetData}>
          すべてのデータをリセットする
        </button>
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: 32,
        paddingTop: 16,
        borderTop: '1px solid var(--border)',
        color: 'var(--text2)',
        fontSize: 12,
      }}>
        <div style={{ fontSize: 20, marginBottom: 4 }}>🗂️</div>
        <div>AI秘書 v1.0</div>
        <div style={{ marginTop: 4 }}>Powered by OpenAI</div>
      </div>
    </div>
  );
}
